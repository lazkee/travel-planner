import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import {
  deleteTravelPlan,
  updateTravelPlan,
} from '../../trips/api/travelPlans.api'
import TripCard from '../../trips/components/TripCard'
import TravelPlanFormModal from '../../trips/components/TravelPlanFormModal'
import type {
  TravelPlanDto,
  TravelPlanRequestDto,
} from '../../trips/types/travelPlan.types'
import { getAdminUserTrips } from '../api/adminUserTrips.api'

function AdminUserPlansPage() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<TravelPlanDto[]>([])
  const [error, setError] = useState('')
  const [editingPlan, setEditingPlan] = useState<TravelPlanDto | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<TravelPlanDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadPlans = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const travelPlans = await getAdminUserTrips()
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

  function handleViewClick(plan: TravelPlanDto) {
    navigate(`/app/admin/user-plans/${plan.id}`)
  }

  function handleEditClick(plan: TravelPlanDto) {
    setEditingPlan(plan)
    setIsFormModalOpen(true)
  }

  function handleCloseFormModal() {
    setIsFormModalOpen(false)
    setEditingPlan(null)
  }

  async function handleSavePlan(request: TravelPlanRequestDto) {
    if (!editingPlan) {
      return
    }

    await updateTravelPlan(editingPlan.id, request)
    await loadPlans()
  }

  async function handleConfirmDelete() {
    if (!deletingPlan) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      await deleteTravelPlan(deletingPlan.id)
      setDeletingPlan(null)
      await loadPlans()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
      setDeletingPlan(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const planCountLabel =
    plans.length === 1 ? '1 user plan' : `${plans.length} user plans`

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="grid gap-2">
          <p className="m-0 text-[0.82rem] font-extrabold uppercase tracking-[0.08em] text-blue-600">
            Admin
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0 text-3xl font-bold leading-tight text-slate-900">
              User Plans
            </h1>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-extrabold text-blue-700">
              {planCountLabel}
            </span>
          </div>
          <p className="m-0 max-w-2xl text-slate-500">
            Plans created by other users.
          </p>
        </div>
      </header>

      {error ? <ErrorAlert message={error} /> : null}

      {isLoading ? <LoadingSpinner label="Loading user plans..." /> : null}

      {!isLoading && !error && plans.length === 0 ? (
        <EmptyState
          description="There are no travel plans from other users yet."
          title="No user plans found"
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
              ownerLabel={`Owner: User #${plan.userId}`}
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
        mode="edit"
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

export default AdminUserPlansPage
