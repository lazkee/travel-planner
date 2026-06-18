import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import { formatCurrency, formatLongDate } from '../../../utils/format'
import type { ActivityDto } from '../types/activity.types'
import ActivityStatusBadge from './ActivityStatusBadge'

type ActivityListProps = {
  activities: ActivityDto[]
  readonly?: boolean
  onDelete?: (activity: ActivityDto) => void
  onEdit?: (activity: ActivityDto) => void
}

function formatTime(value?: string) {
  return value || 'All day'
}

function getDateKey(activity: ActivityDto) {
  return activity.date ? activity.date.slice(0, 10) : 'undated'
}

function sortActivities(a: ActivityDto, b: ActivityDto) {
  const dateCompare = getDateKey(a).localeCompare(getDateKey(b))

  if (dateCompare !== 0) {
    return dateCompare
  }

  return (a.time ?? '').localeCompare(b.time ?? '')
}

function groupActivitiesByDate(activities: ActivityDto[]) {
  return [...activities].sort(sortActivities).reduce<
    Array<{ date: string; activities: ActivityDto[] }>
  >((groups, activity) => {
    const date = getDateKey(activity)
    const existingGroup = groups.find((group) => group.date === date)

    if (existingGroup) {
      existingGroup.activities.push(activity)
    } else {
      groups.push({
        date,
        activities: [activity],
      })
    }

    return groups
  }, [])
}

function ActivityList({
  activities,
  readonly = false,
  onDelete,
  onEdit,
}: ActivityListProps) {
  const groupedActivities = groupActivitiesByDate(activities)

  return (
    <div className="grid gap-4">
      {groupedActivities.map((group) => (
        <section className="grid gap-3" key={group.date}>
          <h3 className="m-0 text-sm font-extrabold uppercase tracking-[0.08em] text-slate-500">
            {group.date === 'undated' ? 'No date' : formatLongDate(group.date)}
          </h3>
          <div className="grid gap-3">
            {group.activities.map((activity) => (
              <Card className="p-4" key={activity.id}>
                <div className="grid gap-4 lg:grid-cols-[96px_minmax(0,1fr)_auto] lg:items-start">
                  <div className="rounded-lg bg-slate-50 p-3 text-sm font-bold text-slate-900">
                    {formatTime(activity.time)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="m-0 text-lg font-bold text-slate-900">
                        {activity.name}
                      </h4>
                      <ActivityStatusBadge status={activity.status} />
                    </div>
                    <dl className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <dt className="font-bold text-slate-900">Location</dt>
                        <dd className="m-0">
                          {activity.location || 'Not specified'}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-900">
                          Estimated cost
                        </dt>
                        <dd className="m-0">
                          {formatCurrency(activity.estimatedCost)}
                        </dd>
                      </div>
                    </dl>
                    {activity.description ? (
                      <p className="m-0 mt-3 text-sm text-slate-600">
                        {activity.description}
                      </p>
                    ) : null}
                  </div>

                  {!readonly ? (
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Button
                        onClick={() => onEdit?.(activity)}
                        variant="primary"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => onDelete?.(activity)}
                        variant="danger"
                      >
                        Delete
                      </Button>
                    </div>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default ActivityList
