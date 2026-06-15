import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import type { TabItem } from '../../../components/ui/Tabs'
import { useAuth } from '../../../context/AuthContext'
import ActivitiesTab from '../../activities/components/ActivitiesTab'
import ChecklistTab from '../../checklist/components/ChecklistTab'
import DestinationsTab from '../../destinations/components/DestinationsTab'
import ExpensesTab from '../../expenses/components/ExpensesTab'
import ShareTab from '../../sharing/components/ShareTab'
import { getBudgetSummary } from '../api/budgetSummary.api'
import {
  deleteTravelPlan,
  getTravelPlanById,
  updateTravelPlan,
} from '../api/travelPlans.api'
import OverviewTab from '../components/OverviewTab'
import TripDetailsView from '../components/TripDetailsView'
import TravelPlanFormModal from '../components/TravelPlanFormModal'
import type { BudgetSummaryDto } from '../types/budgetSummary.types'
import type {
  TravelPlanDto,
  TravelPlanRequestDto,
} from '../types/travelPlan.types'

const tabs: TabItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'destinations', label: 'Destinations' },
  { id: 'activities', label: 'Activities' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'share', label: 'Share' },
]

function parsePlanId(value: string | undefined) {
  if (!value) {
    return null
  }

  const planId = Number(value)

  return Number.isInteger(planId) && planId > 0 ? planId : null
}

function TripDetailsPage() {
  const { planId: planIdParam } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAdmin, user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [plan, setPlan] = useState<TravelPlanDto | null>(null)
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummaryDto | null>(
    null,
  )
  const [error, setError] = useState('')
  const [isBudgetSummaryLoading, setIsBudgetSummaryLoading] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const planId = parsePlanId(planIdParam)
  const isAdminUserPlanRoute = location.pathname.startsWith(
    '/app/admin/user-plans',
  )
  const backPath = isAdminUserPlanRoute ? '/app/admin/user-plans' : '/app/trips'
  const ownerLabel =
    plan && isAdmin && user && plan.userId !== user.id
      ? `Owner: User #${plan.userId}`
      : undefined

  const refreshTripDetails = useCallback(async () => {
    if (!planId) {
      setPlan(null)
      setBudgetSummary(null)
      setError('Invalid trip id.')
      setIsBudgetSummaryLoading(false)
      return
    }

    try {
      const travelPlan = await getTravelPlanById(planId)
      setPlan(travelPlan)
      setIsBudgetSummaryLoading(true)

      try {
        const summary = await getBudgetSummary(planId)
        setBudgetSummary(summary)
      } catch {
        setBudgetSummary(null)
      }
    } catch (requestError) {
      setPlan(null)
      setBudgetSummary(null)
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsBudgetSummaryLoading(false)
    }
  }, [planId])

  const loadPlan = useCallback(async () => {
    setIsLoading(true)
    setError('')
    setBudgetSummary(null)

    await refreshTripDetails()
    setIsLoading(false)
  }, [refreshTripDetails])

  useEffect(() => {
    void loadPlan()
  }, [loadPlan])

  function handleBackClick() {
    navigate(backPath)
  }

  function handleEditClick() {
    setIsFormModalOpen(true)
  }

  function handleCloseFormModal() {
    setIsFormModalOpen(false)
  }

  async function handleSavePlan(request: TravelPlanRequestDto) {
    if (!plan) {
      return
    }

    await updateTravelPlan(plan.id, request)
    await refreshTripDetails()
  }

  function handleDeleteClick() {
    setIsDeleteDialogOpen(true)
  }

  function handleCancelDelete() {
    setIsDeleteDialogOpen(false)
  }

  async function handleConfirmDelete() {
    if (!plan) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      await deleteTravelPlan(plan.id)
      setIsDeleteDialogOpen(false)
      navigate(backPath, { replace: true })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
      setIsDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="grid gap-6">
      {isLoading ? <LoadingSpinner label="Loading trip..." /> : null}

      {!isLoading && error ? (
        <Card className="grid gap-4 p-5">
          <ErrorAlert message={error} />
          <div>
            <Button onClick={loadPlan} variant="secondary">
              Try again
            </Button>
          </div>
        </Card>
      ) : null}

      {!isLoading && !error && plan ? (
        <TripDetailsView
          activeTab={activeTab}
          backButtonLabel={
            isAdminUserPlanRoute ? 'Back to user plans' : 'Back to trips'
          }
          budgetSummary={budgetSummary}
          headerActions={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleEditClick} variant="secondary">
                Edit
              </Button>
              <Button onClick={handleDeleteClick} variant="danger">
                Delete
              </Button>
            </div>
          }
          isBudgetSummaryLoading={isBudgetSummaryLoading}
          onBack={handleBackClick}
          onTabChange={setActiveTab}
          ownerLabel={ownerLabel}
          plan={plan}
          showBackButton
          tabs={tabs}
        >
          {activeTab === 'overview' ? (
            <OverviewTab
              budgetSummary={budgetSummary}
              isBudgetSummaryLoading={isBudgetSummaryLoading}
              ownerLabel={ownerLabel}
              plan={plan}
            />
          ) : null}
          {activeTab === 'destinations' ? (
            <DestinationsTab planId={plan.id} />
          ) : null}
          {activeTab === 'activities' ? (
            <ActivitiesTab
              onActivitiesChanged={refreshTripDetails}
              planId={plan.id}
            />
          ) : null}
          {activeTab === 'expenses' ? (
            <ExpensesTab
              budgetSummary={budgetSummary}
              onExpensesChanged={refreshTripDetails}
              planId={plan.id}
            />
          ) : null}
          {activeTab === 'checklist' ? <ChecklistTab planId={plan.id} /> : null}
          {activeTab === 'share' ? <ShareTab planId={plan.id} /> : null}
        </TripDetailsView>
      ) : null}

      <TravelPlanFormModal
        initialPlan={plan}
        isOpen={isFormModalOpen}
        mode="edit"
        onClose={handleCloseFormModal}
        onSubmit={handleSavePlan}
      />

      <ConfirmDialog
        confirmLabel="Delete trip"
        isOpen={isDeleteDialogOpen}
        isSubmitting={isDeleting}
        message={
          plan
            ? `Delete "${plan.name}"? This cannot be undone.`
            : 'Delete this trip?'
        }
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete trip"
      />
    </section>
  )
}

export default TripDetailsPage
