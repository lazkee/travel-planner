import { useState } from 'react'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorAlert from '../../../components/ui/ErrorAlert'
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

type SharedActivitiesTabProps = {
  activities: ActivityDto[]
  readonly: boolean
  token: string
  onChanged: () => Promise<void>
}

function SharedActivitiesTab({
  activities,
  onChanged,
  readonly,
  token,
}: SharedActivitiesTabProps) {
  const [error, setError] = useState('')
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
    if (editingActivity) {
      await updateSharedActivity(token, editingActivity.id, request)
    } else {
      await createSharedActivity(token, request)
    }

    await onChanged()
  }

  async function handleConfirmDelete() {
    if (!deletingActivity) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      await deleteSharedActivity(token, deletingActivity.id)
      setDeletingActivity(null)
      await onChanged()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
      setDeletingActivity(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="grid gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="m-0 text-xl font-bold text-slate-900">Activities</h2>
          <p className="m-0 mt-1 text-sm text-slate-500">
            Planned events and reservations for this shared trip.
          </p>
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
      </header>

      {error ? <ErrorAlert message={error} /> : null}

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
      ) : (
        <ActivityList
          activities={activities}
          onDelete={setDeletingActivity}
          onEdit={handleEditClick}
          readonly={readonly}
        />
      )}

      <ActivityFormModal
        initialActivity={editingActivity}
        isOpen={isFormModalOpen}
        mode={editingActivity ? 'edit' : 'create'}
        onClose={handleCloseFormModal}
        onSubmit={handleSaveActivity}
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
