import type { ReactNode } from 'react'
import Card from '../../../components/ui/Card'
import type { BudgetSummaryDto } from '../types/budgetSummary.types'
import type { TravelPlanDto } from '../types/travelPlan.types'
import BudgetProgress from './BudgetProgress'

type TripHeaderProps = {
  actions?: ReactNode
  aside?: ReactNode
  badge?: ReactNode
  budgetSummary: BudgetSummaryDto | null
  notice?: ReactNode
  isBudgetSummaryLoading?: boolean
  ownerLabel?: string
  plan: TravelPlanDto
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function formatDate(value: string) {
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? 'Not set' : dateFormatter.format(date)
}

function getDurationInDays(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000
  const days =
    Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) + 1

  return Math.max(days, 1)
}

function MetricItem({
  label,
  value,
  isLoading = false,
}: {
  isLoading?: boolean
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </dt>
      <dd className="m-0 mt-1 text-sm font-bold text-slate-900">
        {isLoading ? (
          <span className="inline-block h-4 w-20 animate-pulse rounded bg-slate-200" />
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function TripHeader({
  actions,
  aside,
  badge,
  budgetSummary,
  notice,
  isBudgetSummaryLoading = false,
  ownerLabel,
  plan,
}: TripHeaderProps) {
  const durationInDays = getDurationInDays(plan.startDate, plan.endDate)
  const budget = budgetSummary?.budget ?? plan.budget
  const spent = budgetSummary?.totalExpenses ?? 0
  const remaining = budgetSummary?.remainingBudget ?? budget

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {badge ?? (
              <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-extrabold text-blue-700">
                Active plan
              </span>
            )}
            {ownerLabel ? (
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-600">
                {ownerLabel}
              </span>
            ) : null}
          </div>
          <h1 className="m-0 text-3xl font-bold leading-tight text-slate-900">
            {plan.name}
          </h1>
        </div>

        {aside || actions ? (
          <div className="flex flex-col gap-3 lg:items-end">
            {aside ? <div>{aside}</div> : null}
            {actions ? <div>{actions}</div> : null}
          </div>
        ) : null}
      </div>

      {notice ? <div className="mt-4">{notice}</div> : null}

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <MetricItem
          label="Date range"
          value={`${formatDate(plan.startDate)} - ${formatDate(plan.endDate)}`}
        />
        <MetricItem
          label="Duration"
          value={
            durationInDays
              ? `${durationInDays} ${durationInDays === 1 ? 'day' : 'days'}`
              : 'Not set'
          }
        />
      </dl>

      <div className="mt-3">
        <BudgetProgress
          budget={budget}
          isLoading={isBudgetSummaryLoading}
          remaining={remaining}
          spent={spent}
        />
      </div>
    </Card>
  )
}

export default TripHeader
