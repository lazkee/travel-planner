import { useState } from 'react'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import { useToast } from '../../../context/ToastContext'
import ActivityCalendar from '../../activities/components/ActivityCalendar'
import ActivityFormModal from '../../activities/components/ActivityFormModal'
import ActivityList from '../../activities/components/ActivityList'
import type {
  ActivityDto,
  ActivityRequestDto,
} from '../../activities/types/activity.types'
import {
  createSharedActivity,
  deleteSharedActivity,
  updateSharedActivity,
} from '../api/sharedEdit.api'

type ActivityViewMode = 'list' | 'calendar'

type SharedActivitiesTabProps = {
  activities: ActivityDto[]
  planEndDate?: string
  planStartDate?: string
  readonly: boolean
  token: string
  onChanged: () => Promise<void>
}

function SharedActivitiesTab({
  activities,
  onChanged,
  planEndDate,
  planStartDate,
  readonly,
  token,
}: SharedActivitiesTabProps) {
  const { showError, showSuccess } = useToast()
  const [viewMode, setViewMode] = useState<ActivityViewMode>('list')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ActivityDto | null>(
    null,
  )
  const [deletingActivity, setDeletingActivity] = useState<ActivityDto | null>(
    null,
  )
  const [isDeleting, setIsDeleting] = useState(false)

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
        await updateSharedActivity(token, editingActivity.id, request)
      } else {
        await createSharedActivity(token, request)
      }

      await onChanged()
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
      await deleteSharedActivity(token, deletingActivity.id)
      setDeletingActivity(null)
      await onChanged()
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
            Planned events and reservations for this shared trip.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-white p-1">
            <button
              className={[
                'rounded-md px-3 py-2 text-sm font-extrabold transition',
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50',
              ].join(' ')}
              onClick={() => setViewMode('list')}
              type="button"
            >
              List
            </button>
            <button
              className={[
                'rounded-md px-3 py-2 text-sm font-extrabold transition',
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50',
              ].join(' ')}
              onClick={() => setViewMode('calendar')}
              type="button"
            >
              Calendar
            </button>
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

      {activities.length === 0 ? (
        <EmptyState
          action={
            !readonly ? (
              <Button onClick={handleAddClick} variant="primary">
                Add activity
              </Button>
            ) : null
          }
          description="Add planned tours, meals, reservations, or events."
          title="No activities yet"
        />
      ) : null}

      {activities.length > 0 && viewMode === 'list' ? (
        <ActivityList
          activities={activities}
          onDelete={setDeletingActivity}
          onEdit={handleEditClick}
          readonly={readonly}
        />
      ) : null}

      {activities.length > 0 && viewMode === 'calendar' ? (
        <ActivityCalendar
          activities={activities}
          onEdit={handleEditClick}
          readonly={readonly}
        />
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

export default SharedActivitiesTab
