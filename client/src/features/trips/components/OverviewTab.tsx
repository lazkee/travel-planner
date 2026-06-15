import Card from '../../../components/ui/Card'
import type { BudgetSummaryDto } from '../types/budgetSummary.types'
import type { TravelPlanDto } from '../types/travelPlan.types'

type OverviewTabProps = {
  budgetSummary: BudgetSummaryDto | null
  isBudgetSummaryLoading?: boolean
  ownerLabel?: string
  plan: TravelPlanDto
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
})

function formatDate(value: string) {
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? 'Not set' : dateFormatter.format(date)
}

function getDurationInDays(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Not set'
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000
  const days =
    Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) + 1
  const duration = Math.max(days, 1)

  return `${duration} ${duration === 1 ? 'day' : 'days'}`
}

function DetailItem({
  isLoading = false,
  label,
  value,
}: {
  isLoading?: boolean
  label: string
  value: string
}) {
  return (
    <div>
      <dt className="text-sm font-bold text-slate-900">{label}</dt>
      <dd className="m-0 mt-1 text-slate-600">
        {isLoading ? (
          <span className="inline-block h-4 w-24 animate-pulse rounded bg-slate-200" />
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function OverviewTab({
  budgetSummary,
  isBudgetSummaryLoading = false,
  ownerLabel,
  plan,
}: OverviewTabProps) {
  const budget = budgetSummary?.budget ?? plan.budget
  const spent = currencyFormatter.format(budgetSummary?.totalExpenses ?? 0)
  const remaining = currencyFormatter.format(
    budgetSummary?.remainingBudget ?? budget,
  )

  return (
    <Card className="p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4">
          <div>
            <h2 className="m-0 text-xl font-bold text-slate-900">Overview</h2>
            <p className="m-0 mt-1 text-sm text-slate-500">
              Core details for this travel plan.
            </p>
          </div>
          <div className="grid gap-4 rounded-lg bg-slate-50 p-4">
            <section>
              <h3 className="m-0 text-sm font-bold text-slate-900">
                Description
              </h3>
              <p className="m-0 mt-1 text-sm text-slate-600">
                {plan.description || 'No description has been added yet.'}
              </p>
            </section>
            <section>
              <h3 className="m-0 text-sm font-bold text-slate-900">Notes</h3>
              <p className="m-0 mt-1 text-sm text-slate-600">
                {plan.notes || 'No notes have been added yet.'}
              </p>
            </section>
          </div>
        </div>

        <dl className="grid gap-4 rounded-lg border border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-1">
          {ownerLabel ? (
            <DetailItem
              label="Owner"
              value={ownerLabel.replace('Owner: ', '')}
            />
          ) : null}
          <DetailItem label="Start date" value={formatDate(plan.startDate)} />
          <DetailItem label="End date" value={formatDate(plan.endDate)} />
          <DetailItem
            label="Duration"
            value={getDurationInDays(plan.startDate, plan.endDate)}
          />
          <DetailItem label="Budget" value={currencyFormatter.format(budget)} />
          <DetailItem
            isLoading={isBudgetSummaryLoading}
            label="Spent"
            value={spent}
          />
          <DetailItem
            isLoading={isBudgetSummaryLoading}
            label="Remaining"
            value={remaining}
          />
          <DetailItem label="Created date" value={formatDate(plan.createdAt)} />
        </dl>
      </div>
    </Card>
  )
}

export default OverviewTab
