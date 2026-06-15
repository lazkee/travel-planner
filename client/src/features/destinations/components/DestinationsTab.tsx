import { useCallback, useEffect, useState } from 'react'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { useToast } from '../../../context/ToastContext'
import {
  createDestination,
  deleteDestination,
  getDestinations,
  updateDestination,
} from '../api/destinations.api'
import type {
  DestinationDto,
  DestinationRequestDto,
} from '../types/destination.types'
import DestinationCard from './DestinationCard'
import DestinationFormModal from './DestinationFormModal'

type DestinationsTabProps = {
  planId: number
  readonly?: boolean
}

function DestinationsTab({ planId, readonly = false }: DestinationsTabProps) {
  const { showError, showSuccess } = useToast()
  const [destinations, setDestinations] = useState<DestinationDto[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingDestination, setEditingDestination] =
    useState<DestinationDto | null>(null)
  const [deletingDestination, setDeletingDestination] =
    useState<DestinationDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadDestinations = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const nextDestinations = await getDestinations(planId)
      setDestinations(nextDestinations)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [planId])

  useEffect(() => {
    void loadDestinations()
  }, [loadDestinations])

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
    try {
      if (editingDestination) {
        await updateDestination(planId, editingDestination.id, request)
      } else {
        await createDestination(planId, request)
      }

      await loadDestinations()
      showSuccess(
        editingDestination ? 'Destination updated.' : 'Destination added.',
      )
    } catch (requestError) {
      showError(getApiErrorMessage(requestError))
      throw requestError
    }
  }

  async function handleConfirmDelete() {
    if (!deletingDestination) {
      return
    }

    setIsDeleting(true)

    try {
      await deleteDestination(planId, deletingDestination.id)
      setDeletingDestination(null)
      await loadDestinations()
      showSuccess('Destination deleted.')
    } catch (requestError) {
      showError(getApiErrorMessage(requestError))
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
            Manage the places included in this travel plan.
          </p>
        </div>
        {!readonly ? (
          <Button className="w-full sm:w-auto" onClick={handleAddClick}>
            Add destination
          </Button>
        ) : null}
      </header>

      {error ? <ErrorAlert message={error} /> : null}

      {isLoading ? <LoadingSpinner label="Loading destinations..." /> : null}

      {!isLoading && !error && destinations.length === 0 ? (
        <EmptyState
          action={
            !readonly ? (
              <Button onClick={handleAddClick}>Add destination</Button>
            ) : null
          }
          description="Add the cities, stops, or places that belong to this trip."
          title="No destinations yet"
        />
      ) : null}

      {!isLoading && destinations.length > 0 ? (
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
      ) : null}

      {!isLoading && error && destinations.length === 0 ? (
        <div>
          <Button onClick={loadDestinations} variant="secondary">
            Try again
          </Button>
        </div>
      ) : null}

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

export default DestinationsTab
