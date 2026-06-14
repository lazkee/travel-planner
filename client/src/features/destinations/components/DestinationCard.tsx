import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import type { DestinationDto } from '../types/destination.types'

type DestinationCardProps = {
  destination: DestinationDto
  readonly?: boolean
  onDelete?: (destination: DestinationDto) => void
  onEdit?: (destination: DestinationDto) => void
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

function DestinationCard({
  destination,
  readonly = false,
  onDelete,
  onEdit,
}: DestinationCardProps) {
  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex flex-1 flex-col gap-4">
        <div>
          <p className="mb-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-extrabold text-blue-700">
            Destination
          </p>
          <h3 className="m-0 text-xl font-bold text-slate-900">
            {destination.name}
          </h3>
          <p className="m-0 mt-1 text-sm font-medium text-slate-500">
            {destination.location}
          </p>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="font-bold text-slate-900">Arrival</dt>
            <dd className="m-0 text-slate-600">
              {formatDate(destination.arrivalDate)}
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="font-bold text-slate-900">Departure</dt>
            <dd className="m-0 text-slate-600">
              {formatDate(destination.departureDate)}
            </dd>
          </div>
        </dl>

        {destination.description ? (
          <p className="m-0 text-sm text-slate-600">
            {destination.description}
          </p>
        ) : null}
      </div>

      {!readonly ? (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <Button onClick={() => onEdit?.(destination)} variant="secondary">
            Edit
          </Button>
          <Button onClick={() => onDelete?.(destination)} variant="ghost">
            Delete
          </Button>
        </div>
      ) : null}
    </Card>
  )
}

export default DestinationCard
