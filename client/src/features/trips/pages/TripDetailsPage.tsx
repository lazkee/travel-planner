import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import Tabs, { type TabItem } from '../../../components/ui/Tabs'
import ActivitiesTab from '../../activities/components/ActivitiesTab'
import DestinationsTab from '../../destinations/components/DestinationsTab'
import ExpensesTab from '../../expenses/components/ExpensesTab'
import { getBudgetSummary } from '../api/budgetSummary.api'
import { getTravelPlanById } from '../api/travelPlans.api'
import OverviewTab from '../components/OverviewTab'
import TripHeader from '../components/TripHeader'
import type { BudgetSummaryDto } from '../types/budgetSummary.types'
import type { TravelPlanDto } from '../types/travelPlan.types'

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
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [plan, setPlan] = useState<TravelPlanDto | null>(null)
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummaryDto | null>(
    null,
  )
  const [error, setError] = useState('')
  const [isBudgetSummaryLoading, setIsBudgetSummaryLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const planId = parsePlanId(planIdParam)

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
    navigate('/app/trips')
  }

  const selectedTab = tabs.find((tab) => tab.id === activeTab)

  return (
    <section className="grid gap-6">
      <div>
        <Button onClick={handleBackClick} variant="secondary">
          Back to trips
        </Button>
      </div>

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
        <>
          <TripHeader
            budgetSummary={budgetSummary}
            isBudgetSummaryLoading={isBudgetSummaryLoading}
            plan={plan}
          />

          <Card className="overflow-hidden">
            <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />
            <div className="p-5">
              {activeTab === 'overview' ? (
                <OverviewTab
                  budgetSummary={budgetSummary}
                  isBudgetSummaryLoading={isBudgetSummaryLoading}
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
              {activeTab !== 'overview' &&
              activeTab !== 'destinations' &&
              activeTab !== 'activities' &&
              activeTab !== 'expenses' &&
              selectedTab ? (
                <EmptyState
                  description={`${selectedTab.label} will be added in a future feature step.`}
                  title={`${selectedTab.label} coming next`}
                />
              ) : null}
            </div>
          </Card>
        </>
      ) : null}
    </section>
  )
}

export default TripDetailsPage
