import { useState } from 'react'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import DestinationCard from '../../destinations/components/DestinationCard'
import DestinationFormModal from '../../destinations/components/DestinationFormModal'
import type {
  DestinationDto,
  DestinationRequestDto,
} from '../../destinations/types/destination.types'
import {
  createSharedDestination,
  deleteSharedDestination,
  updateSharedDestination,
} from '../api/sharedEdit.api'

type SharedDestinationsTabProps = {
  destinations: DestinationDto[]
  readonly: boolean
  token: string
  onChanged: () => Promise<void>
}

function SharedDestinationsTab({
  destinations,
  onChanged,
  readonly,
  token,
}: SharedDestinationsTabProps) {
  const [error, setError] = useState('')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingDestination, setEditingDestination] =
    useState<DestinationDto | null>(null)
  const [deletingDestination, setDeletingDestination] =
    useState<DestinationDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function handleAddClick() {
    setEditingDestination(null)
    setIsFormModalOpen(true)
  }

  function handleEditClick(destination: DestinationDto) {
    setEditingDestination(destination)
    setIsFormModalOpen(true)
  }

  function handleCloseFormModal() {
    setIsFormModalOpen(false)
    setEditingDestination(null)
  }

  async function handleSaveDestination(request: DestinationRequestDto) {
    if (editingDestination) {
      await updateSharedDestination(token, editingDestination.id, request)
    } else {
      await createSharedDestination(token, request)
    }

    await onChanged()
  }

  async function handleConfirmDelete() {
    if (!deletingDestination) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      await deleteSharedDestination(token, deletingDestination.id)
      setDeletingDestination(null)
      await onChanged()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
      setDeletingDestination(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="grid gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="m-0 text-xl font-bold text-slate-900">
            Destinations
          </h2>
          <p className="m-0 mt-1 text-sm text-slate-500">
            Places included in this shared travel plan.
          </p>
        </div>
        {!readonly ? (
          <Button
            className="w-full sm:w-auto"
            onClick={handleAddClick}
            variant="primary"
          >
            Add destination
          </Button>
        ) : null}
      </header>

      {error ? <ErrorAlert message={error} /> : null}

      {destinations.length === 0 ? (
        <EmptyState
          action={
            !readonly ? (
              <Button onClick={handleAddClick} variant="primary">
                Add destination
              </Button>
            ) : null
          }
          description="Add the cities, stops, or places that belong to this trip."
          title="No destinations yet"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {destinations.map((destination) => (
            <DestinationCard
              destination={destination}
              key={destination.id}
              onDelete={setDeletingDestination}
              onEdit={handleEditClick}
              readonly={readonly}
            />
          ))}
        </div>
      )}

      <DestinationFormModal
        initialDestination={editingDestination}
        isOpen={isFormModalOpen}
        mode={editingDestination ? 'edit' : 'create'}
        onClose={handleCloseFormModal}
        onSubmit={handleSaveDestination}
      />

      <ConfirmDialog
        confirmLabel="Delete destination"
        isOpen={Boolean(deletingDestination)}
        isSubmitting={isDeleting}
        message={
          deletingDestination
            ? `Delete "${deletingDestination.name}"? This cannot be undone.`
            : 'Delete this destination?'
        }
        onCancel={() => setDeletingDestination(null)}
        onConfirm={handleConfirmDelete}
        title="Delete destination"
      />
    </section>
  )
}

export default SharedDestinationsTab
