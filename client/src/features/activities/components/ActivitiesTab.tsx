import { useCallback, useEffect, useState } from 'react'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { useToast } from '../../../context/ToastContext'
import {
  createActivity,
  deleteActivity,
  getActivities,
  updateActivity,
} from '../api/activities.api'
import type { ActivityDto, ActivityRequestDto } from '../types/activity.types'
import ActivityCalendar from './ActivityCalendar'
import ActivityFormModal from './ActivityFormModal'
import ActivityList from './ActivityList'

type ActivitiesTabProps = {
  onActivitiesChanged?: () => void | Promise<void>
  planEndDate?: string
  planId: number
  planStartDate?: string
  readonly?: boolean
}

type ActivityViewMode = 'list' | 'calendar'

function ActivitiesTab({
  onActivitiesChanged,
  planEndDate,
  planId,
  planStartDate,
  readonly = false,
}: ActivitiesTabProps) {
  const { showError, showSuccess } = useToast()
  const [activities, setActivities] = useState<ActivityDto[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ActivityViewMode>('list')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ActivityDto | null>(
    null,
  )
  const [deletingActivity, setDeletingActivity] = useState<ActivityDto | null>(
    null,
  )
  const [isDeleting, setIsDeleting] = useState(false)

  const loadActivities = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const nextActivities = await getActivities(planId)
      setActivities(nextActivities)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [planId])

  useEffect(() => {
    void loadActivities()
  }, [loadActivities])

  function handleAddClick() {
    setEditingActivity(null)
    setIsFormModalOpen(true)
  }

  function handleEditClick(activity: ActivityDto) {
    setEditingActivity(activity)
    setIsFormModalOpen(true)
  }

  function handleCloseFormModal() {
    setIsFormModalOpen(false)
    setEditingActivity(null)
  }

  async function handleSaveActivity(request: ActivityRequestDto) {
    try {
      if (editingActivity) {
        await updateActivity(planId, editingActivity.id, request)
      } else {
        await createActivity(planId, request)
      }

      await loadActivities()
      await onActivitiesChanged?.()
      showSuccess(editingActivity ? 'Activity updated.' : 'Activity added.')
    } catch (requestError) {
      showError(getApiErrorMessage(requestError))
      throw requestError
    }
  }

  async function handleConfirmDelete() {
    if (!deletingActivity) {
      return
    }

    setIsDeleting(true)

    try {
      await deleteActivity(planId, deletingActivity.id)
      setDeletingActivity(null)
      await loadActivities()
      await onActivitiesChanged?.()
      showSuccess('Activity deleted.')
    } catch (requestError) {
      showError(getApiErrorMessage(requestError))
      setDeletingActivity(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="grid gap-5">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="m-0 text-xl font-bold text-slate-900">Activities</h2>
          <p className="m-0 mt-1 text-sm text-slate-500">
            Plan reservations, events, and itinerary items for this trip.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
            <Button
              className="h-10 w-full rounded-xl px-3 py-1.5 text-sm"
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
            >
              List
            </Button>
            <Button
              className="h-10 w-full rounded-xl px-3 py-1.5 text-sm"
              onClick={() => setViewMode('calendar')}
              variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
            >
              Calendar
            </Button>
          </div>

          {!readonly ? (
            <Button
              className="w-full sm:w-auto"
              onClick={handleAddClick}
              variant="primary"
            >
              Add activity
            </Button>
          ) : null}
        </div>
      </header>

      {error ? <ErrorAlert message={error} /> : null}

      {isLoading ? <LoadingSpinner label="Loading activities..." /> : null}

      {!isLoading && !error && activities.length === 0 ? (
        <EmptyState
          action={
            !readonly ? (
              <Button onClick={handleAddClick} variant="primary">
                Add activity
              </Button>
            ) : null
          }
          description="Add reservations, tours, meals, and other planned items for this trip."
          title="No activities yet"
        />
      ) : null}

      {!isLoading && activities.length > 0 && viewMode === 'list' ? (
        <ActivityList
          activities={activities}
          onDelete={setDeletingActivity}
          onEdit={handleEditClick}
          readonly={readonly}
        />
      ) : null}

      {!isLoading && activities.length > 0 && viewMode === 'calendar' ? (
        <ActivityCalendar
          activities={activities}
          onEdit={handleEditClick}
          readonly={readonly}
        />
      ) : null}

      {!isLoading && error && activities.length === 0 ? (
        <div>
          <Button onClick={loadActivities} variant="secondary">
            Try again
          </Button>
        </div>
      ) : null}

      <ActivityFormModal
        initialActivity={editingActivity}
        isOpen={isFormModalOpen}
        mode={editingActivity ? 'edit' : 'create'}
        onClose={handleCloseFormModal}
        onSubmit={handleSaveActivity}
        planEndDate={planEndDate}
        planStartDate={planStartDate}
      />

      <ConfirmDialog
        confirmLabel="Delete activity"
        isOpen={Boolean(deletingActivity)}
        isSubmitting={isDeleting}
        message={
          deletingActivity
            ? `Delete "${deletingActivity.name}"? This cannot be undone.`
            : 'Delete this activity?'
        }
        onCancel={() => setDeletingActivity(null)}
        onConfirm={handleConfirmDelete}
        title="Delete activity"
      />
    </section>
  )
}

export default ActivitiesTab
