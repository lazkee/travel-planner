import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import type { TravelPlanDto } from '../types/travelPlan.types'

type TripCardProps = {
  ownerLabel?: string
  plan: TravelPlanDto
  readonly?: boolean
  onDelete?: (plan: TravelPlanDto) => void
  onEdit?: (plan: TravelPlanDto) => void
  onView?: (plan: TravelPlanDto) => void
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
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
    return null
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000
  const days = Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) + 1

  return Math.max(days, 1)
}

function TripCard({
  ownerLabel,
  plan,
  readonly = false,
  onDelete,
  onEdit,
  onView,
}: TripCardProps) {
  const durationInDays = getDurationInDays(plan.startDate, plan.endDate)

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-extrabold text-blue-700">
              Active plan
            </p>
            {ownerLabel ? (
              <p className="mb-2 ml-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-600">
                {ownerLabel}
              </p>
            ) : null}
            <h2 className="m-0 truncate text-xl font-bold text-slate-900">
              {plan.name}
            </h2>
          </div>
        </div>

        {plan.description ? (
          <p className="m-0 line-clamp-3 text-sm text-slate-600">
            {plan.description}
          </p>
        ) : (
          <p className="m-0 text-sm text-slate-400">No description yet.</p>
        )}

        <dl className="grid gap-3 text-sm">
          <div>
            <dt className="font-bold text-slate-900">Dates</dt>
            <dd className="m-0 text-slate-600">
              {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
            </dd>
          </div>
          {durationInDays ? (
            <div>
              <dt className="font-bold text-slate-900">Duration</dt>
              <dd className="m-0 text-slate-600">
                {durationInDays} {durationInDays === 1 ? 'day' : 'days'}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="font-bold text-slate-900">Budget</dt>
            <dd className="m-0 text-slate-600">
              {currencyFormatter.format(plan.budget)}
            </dd>
          </div>
        </dl>

        {plan.notes ? (
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            <p className="m-0 font-bold text-slate-900">Notes</p>
            <p className="m-0 mt-1 line-clamp-3">{plan.notes}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <Button onClick={() => onView?.(plan)} variant="secondary">
          View
        </Button>
        {!readonly ? (
          <>
            <Button onClick={() => onEdit?.(plan)} variant="secondary">
              Edit
            </Button>
            <Button onClick={() => onDelete?.(plan)} variant="ghost">
              Delete
            </Button>
          </>
        ) : null}
      </div>
    </Card>
  )
}

export default TripCard
