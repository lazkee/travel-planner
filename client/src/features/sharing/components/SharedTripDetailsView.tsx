import { useMemo, useState } from 'react'
import Button from '../../../components/ui/Button'
import type { TabItem } from '../../../components/ui/Tabs'
import OverviewTab from '../../trips/components/OverviewTab'
import TravelPlanFormModal from '../../trips/components/TravelPlanFormModal'
import TripDetailsView from '../../trips/components/TripDetailsView'
import type { BudgetSummaryDto } from '../../trips/types/budgetSummary.types'
import type {
  TravelPlanDto,
  TravelPlanRequestDto,
} from '../../trips/types/travelPlan.types'
import { updateSharedTravelPlan } from '../api/sharedEdit.api'
import type { SharedTravelPlanDto } from '../types/sharedPlan.types'
import ShareAccessBadge from './ShareAccessBadge'
import SharedActivitiesTab from './SharedActivitiesTab'
import SharedChecklistTab from './SharedChecklistTab'
import SharedDestinationsTab from './SharedDestinationsTab'
import SharedExpensesTab from './SharedExpensesTab'

type SharedTripDetailsViewProps = {
  backButtonLabel?: string
  onBack?: () => void
  sharedPlan: SharedTravelPlanDto
  showBackButton?: boolean
  token: string
  onReload: () => Promise<void>
}

const tabs: TabItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'destinations', label: 'Destinations' },
  { id: 'activities', label: 'Activities' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'checklist', label: 'Checklist' },
]

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatDateTime(value: string) {
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? 'Not set' : dateTimeFormatter.format(date)
}

function getUsedBudget(plan: SharedTravelPlanDto) {
  const recordedExpenses = plan.expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  )
  const activityCosts = plan.activities
    .filter(
      (activity) =>
        activity.status !== 'Cancelled' && activity.estimatedCost > 0,
    )
    .reduce((total, activity) => total + activity.estimatedCost, 0)

  return recordedExpenses + activityCosts
}

function buildSharedBudgetSummary(plan: SharedTravelPlanDto): BudgetSummaryDto {
  const usedBudget = getUsedBudget(plan)

  return {
    travelPlanId: plan.id,
    budget: plan.budget,
    totalExpenses: usedBudget,
    remainingBudget: plan.budget - usedBudget,
    categories: plan.budgetSummary.categories,
  }
}

function toTravelPlanDto(plan: SharedTravelPlanDto): TravelPlanDto {
  return {
    id: plan.id,
    userId: 0,
    name: plan.name,
    description: plan.description,
    startDate: plan.startDate,
    endDate: plan.endDate,
    budget: plan.budget,
    notes: plan.notes,
    createdAt: plan.createdAt,
  }
}

function SharedTripDetailsView({
  backButtonLabel,
  onBack,
  onReload,
  sharedPlan,
  showBackButton = false,
  token,
}: SharedTripDetailsViewProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const budgetSummary = useMemo(
    () => buildSharedBudgetSummary(sharedPlan),
    [sharedPlan],
  )
  const travelPlan = useMemo(() => toTravelPlanDto(sharedPlan), [sharedPlan])
  const readonly = sharedPlan.accessLevel !== 'Edit'

  function handleClosePlanModal() {
    setIsPlanModalOpen(false)
  }

  async function handleSavePlan(request: TravelPlanRequestDto) {
    await updateSharedTravelPlan(token, request)
    await onReload()
  }

  const headerBadge = (
    <>
      <ShareAccessBadge accessLevel={sharedPlan.accessLevel} />
      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-extrabold text-blue-700">
        Shared plan
      </span>
    </>
  )

  const headerAside = (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
      Expires{' '}
      <span className="font-bold text-slate-900">
        {formatDateTime(sharedPlan.expiresAtUtc)}
      </span>
    </div>
  )

  const headerNotice =
    sharedPlan.accessLevel === 'Edit' ? (
      <div className="flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 sm:flex-row sm:items-center sm:justify-between">
        <span>
          This link has edit access. Changes made here update the shared trip.
        </span>
        <Button
          className="w-full sm:w-auto"
          onClick={() => setIsPlanModalOpen(true)}
          variant="primary"
        >
          Edit trip
        </Button>
      </div>
    ) : null

  return (
    <>
      <TripDetailsView
        activeTab={activeTab}
        backButtonLabel={backButtonLabel}
        budgetSummary={budgetSummary}
        headerAside={headerAside}
        headerBadge={headerBadge}
        headerNotice={headerNotice}
        onBack={onBack}
        onTabChange={setActiveTab}
        plan={travelPlan}
        showBackButton={showBackButton}
        tabs={tabs}
      >
        {activeTab === 'overview' ? (
          <OverviewTab budgetSummary={budgetSummary} plan={travelPlan} />
        ) : null}
        {activeTab === 'destinations' ? (
          <SharedDestinationsTab
            destinations={sharedPlan.destinations}
            onChanged={onReload}
            readonly={readonly}
            token={token}
          />
        ) : null}
        {activeTab === 'activities' ? (
          <SharedActivitiesTab
            activities={sharedPlan.activities}
            onChanged={onReload}
            readonly={readonly}
            token={token}
          />
        ) : null}
        {activeTab === 'expenses' ? (
          <SharedExpensesTab
            activities={sharedPlan.activities}
            expenses={sharedPlan.expenses}
            onChanged={onReload}
            readonly={readonly}
            token={token}
          />
        ) : null}
        {activeTab === 'checklist' ? (
          <SharedChecklistTab
            items={sharedPlan.checklistItems}
            onChanged={onReload}
            readonly={readonly}
            token={token}
          />
        ) : null}
      </TripDetailsView>

      <TravelPlanFormModal
        initialPlan={travelPlan}
        isOpen={isPlanModalOpen}
        mode="edit"
        onClose={handleClosePlanModal}
        onSubmit={handleSavePlan}
      />
    </>
  )
}

export default SharedTripDetailsView
