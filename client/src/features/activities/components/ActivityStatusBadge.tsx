import type { ActivityStatus } from '../types/activity.types'

type ActivityStatusBadgeProps = {
  status: ActivityStatus
}

const statusClassNames: Record<ActivityStatus, string> = {
  Planned: 'bg-blue-50 text-blue-700',
  Reserved: 'bg-amber-50 text-amber-700',
  Completed: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-slate-100 text-slate-600',
}

function ActivityStatusBadge({ status }: ActivityStatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold',
        statusClassNames[status],
      ].join(' ')}
    >
      {status}
    </span>
  )
}

export default ActivityStatusBadge
