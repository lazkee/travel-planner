import { format, getDay, parse, startOfWeek } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import { Calendar, dateFnsLocalizer, type Event } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import type { ActivityDto } from '../types/activity.types'
import ActivityStatusBadge from './ActivityStatusBadge'

type ActivityCalendarProps = {
  activities: ActivityDto[]
  readonly?: boolean
  onEdit?: (activity: ActivityDto) => void
}

type ActivityCalendarEvent = Event & {
  resource: ActivityDto
}

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  getDay,
  locales,
  parse,
  startOfWeek,
})

function getActivityStart(activity: ActivityDto) {
  const date = activity.date ? activity.date.slice(0, 10) : ''
  const time = activity.time || '12:00'
  const parsedDate = new Date(`${date}T${time}`)

  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate
}

function mapActivityToEvent(activity: ActivityDto): ActivityCalendarEvent {
  const start = getActivityStart(activity)
  const end = new Date(start.getTime() + 60 * 60 * 1000)

  return {
    allDay: !activity.time,
    end,
    resource: activity,
    start,
    title: activity.name,
  }
}

function ActivityCalendar({
  activities,
  readonly = false,
  onEdit,
}: ActivityCalendarProps) {
  const events = activities.map(mapActivityToEvent)

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="min-h-[560px] text-sm text-slate-700">
        <Calendar<ActivityCalendarEvent>
          eventPropGetter={() => ({
            className: 'rounded border-0 bg-blue-600 text-white',
          })}
          events={events}
          localizer={localizer}
          onSelectEvent={(event) => {
            if (!readonly) {
              onEdit?.(event.resource)
            }
          }}
          popup
          startAccessor="start"
          endAccessor="end"
          style={{ height: 560 }}
          views={['month', 'week', 'day', 'agenda']}
          components={{
            event: ({ event }) => (
              <span className="inline-flex items-center gap-1">
                <span>{event.title}</span>
              </span>
            ),
            agenda: {
              event: ({ event }) => (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{event.title}</span>
                  <ActivityStatusBadge status={event.resource.status} />
                </div>
              ),
            },
          }}
        />
      </div>
    </div>
  )
}

export default ActivityCalendar
