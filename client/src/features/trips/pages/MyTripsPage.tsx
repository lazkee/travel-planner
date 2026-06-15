import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { useToast } from '../../../context/ToastContext'
import {
  createTravelPlan,
  deleteTravelPlan,
  getTravelPlans,
  updateTravelPlan,
} from '../api/travelPlans.api'
import TripCard from '../components/TripCard'
import TravelPlanFormModal from '../components/TravelPlanFormModal'
import type {
  TravelPlanDto,
  TravelPlanRequestDto,
} from '../types/travelPlan.types'

function MyTripsPage() {
  const navigate = useNavigate()
  const { showError, showSuccess } = useToast()
  const [plans, setPlans] = useState<TravelPlanDto[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<TravelPlanDto | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<TravelPlanDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadPlans = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const travelPlans = await getTravelPlans()
      setPlans(travelPlans)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPlans()
  }, [loadPlans])

  function handleCreateClick() {
    setEditingPlan(null)
    setIsFormModalOpen(true)
  }

  function handleEditClick(plan: TravelPlanDto) {
    setEditingPlan(plan)
    setIsFormModalOpen(true)
  }

  function handleViewClick(plan: TravelPlanDto) {
    navigate(`/app/trips/${plan.id}`)
  }

  function handleCloseFormModal() {
    setIsFormModalOpen(false)
    setEditingPlan(null)
  }

  async function handleSavePlan(request: TravelPlanRequestDto) {
    try {
      if (editingPlan) {
        await updateTravelPlan(editingPlan.id, request)
      } else {
        await createTravelPlan(request)
      }

      await loadPlans()
      showSuccess(editingPlan ? 'Trip updated.' : 'Trip created.')
    } catch (requestError) {
      showError(getApiErrorMessage(requestError))
      throw requestError
    }
  }

  async function handleConfirmDelete() {
    if (!deletingPlan) {
      return
    }

    setIsDeleting(true)

    try {
      await deleteTravelPlan(deletingPlan.id)
      setDeletingPlan(null)
      await loadPlans()
      showSuccess('Trip deleted.')
    } catch (requestError) {
      showError(getApiErrorMessage(requestError))
      setDeletingPlan(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const planCountLabel =
    plans.length === 1 ? '1 active plan' : `${plans.length} active plans`

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="grid gap-2">
          <p className="m-0 text-[0.82rem] font-extrabold tracking-[0.08em] text-blue-600 uppercase">
            Trips
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0 text-3xl leading-tight font-bold text-slate-900">
              My Trips
            </h1>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-extrabold text-blue-700">
              {planCountLabel}
            </span>
          </div>
          <p className="m-0 max-w-2xl text-slate-500">
            Create and manage your travel plans before adding destinations,
            activities, expenses, and checklists in later steps.
          </p>
        </div>
        <Button
          className="w-full md:w-auto"
          onClick={handleCreateClick}
          variant="primary"
        >
          New Trip
        </Button>
      </header>

      {error ? <ErrorAlert message={error} /> : null}

      {isLoading ? <LoadingSpinner label="Loading trips..." /> : null}

      {!isLoading && !error && plans.length === 0 ? (
        <EmptyState
          action={
            <Button onClick={handleCreateClick} variant="primary">
              New Trip
            </Button>
          }
          description="Start by creating your first travel plan. Destinations and activities will be added in future steps."
          title="No trips yet"
        />
      ) : null}

      {!isLoading && plans.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <TripCard
              key={plan.id}
              onDelete={setDeletingPlan}
              onEdit={handleEditClick}
              onView={handleViewClick}
              plan={plan}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && error && plans.length === 0 ? (
        <div>
          <Button onClick={loadPlans} variant="secondary">
            Try again
          </Button>
        </div>
      ) : null}

      <TravelPlanFormModal
        initialPlan={editingPlan}
        isOpen={isFormModalOpen}
        mode={editingPlan ? 'edit' : 'create'}
        onClose={handleCloseFormModal}
        onSubmit={handleSavePlan}
      />

      <ConfirmDialog
        confirmLabel="Delete trip"
        isOpen={Boolean(deletingPlan)}
        isSubmitting={isDeleting}
        message={
          deletingPlan
            ? `Delete "${deletingPlan.name}"? This cannot be undone.`
            : 'Delete this trip?'
        }
        onCancel={() => setDeletingPlan(null)}
        onConfirm={handleConfirmDelete}
        title="Delete trip"
      />
    </section>
  )
}

export default MyTripsPage
