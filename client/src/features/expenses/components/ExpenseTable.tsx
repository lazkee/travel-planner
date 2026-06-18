import ActivityStatusBadge from '../../activities/components/ActivityStatusBadge'
import type { ActivityDto } from '../../activities/types/activity.types'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import EmptyState from '../../../components/ui/EmptyState'
import { formatCurrency, formatDate } from '../../../utils/format'
import type {
  ExpenseDto,
  ExpenseFilter,
} from '../types/expense.types'
import ExpenseCategoryBadge from './ExpenseCategoryBadge'

type ExpenseTableProps = {
  activities: ActivityDto[]
  expenses: ExpenseDto[]
  readonly?: boolean
  selectedFilter: ExpenseFilter
  onDelete?: (expense: ExpenseDto) => void
  onDeleteActivity?: (activity: ActivityDto) => void
  onEdit?: (expense: ExpenseDto) => void
  onEditActivity?: (activity: ActivityDto) => void
}

type ExpenseDisplayRow =
  | {
      kind: 'expense'
      amount: number
      date: string
      expense: ExpenseDto
      name: string
    }
  | {
      kind: 'activity'
      activity: ActivityDto
      amount: number
      date: string
      name: string
    }

function getActivityCostRows(activities: ActivityDto[]) {
  return activities.filter(
    (activity) =>
      activity.status !== 'Cancelled' && activity.estimatedCost > 0,
  )
}

function sortRows(a: ExpenseDisplayRow, b: ExpenseDisplayRow) {
  const dateCompare = a.date.localeCompare(b.date)

  if (dateCompare !== 0) {
    return dateCompare
  }

  return a.name.localeCompare(b.name)
}

function getRows(
  expenses: ExpenseDto[],
  activities: ActivityDto[],
  selectedFilter: ExpenseFilter,
) {
  const activityRows = getActivityCostRows(activities).map<ExpenseDisplayRow>(
    (activity) => ({
      activity,
      amount: activity.estimatedCost,
      date: activity.date,
      kind: 'activity',
      name: activity.name,
    }),
  )

  if (selectedFilter === 'Activities') {
    return activityRows.sort(sortRows)
  }

  const expenseRows = expenses
    .filter(
      (expense) =>
        selectedFilter === 'All' || expense.category === selectedFilter,
    )
    .map<ExpenseDisplayRow>((expense) => ({
      amount: expense.amount,
      date: expense.date,
      expense,
      kind: 'expense',
      name: expense.name,
    }))

  return selectedFilter === 'All'
    ? [...expenseRows, ...activityRows].sort(sortRows)
    : expenseRows.sort(sortRows)
}

function ExpenseTable({
  activities,
  expenses,
  onDelete,
  onDeleteActivity,
  onEdit,
  onEditActivity,
  readonly = false,
  selectedFilter,
}: ExpenseTableProps) {
  const rows = getRows(expenses, activities, selectedFilter)

  if (rows.length === 0) {
    return (
      <EmptyState
        description="Change filters or add a recorded expense to see budget items here."
        title="No budget items found"
      />
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Amount</th>
              {!readonly ? <th className="px-4 py-3 text-right">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row) => (
              <tr
                className={row.kind === 'activity' ? 'bg-emerald-50/30' : ''}
                key={`${row.kind}-${row.kind === 'expense' ? row.expense.id : row.activity.id}`}
              >
                <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                  {formatDate(row.date)}
                </td>
                <td className="px-4 py-4">
                  <p className="m-0 font-bold text-slate-900">{row.name}</p>
                  {row.kind === 'expense' && row.expense.description ? (
                    <p className="m-0 mt-1 text-slate-500">
                      {row.expense.description}
                    </p>
                  ) : null}
                  {row.kind === 'activity' ? (
                    <p className="m-0 mt-1 text-slate-500">
                      Activity estimated cost
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-4">
                  {row.kind === 'expense' ? (
                    <ExpenseCategoryBadge category={row.expense.category} />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <ExpenseCategoryBadge category="Activities" />
                      <ActivityStatusBadge status={row.activity.status} />
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-right font-bold text-slate-900">
                  {formatCurrency(row.amount)}
                </td>
                {!readonly ? (
                  <td className="px-4 py-4">
                    {row.kind === 'expense' ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => onEdit?.(row.expense)}
                          variant="primary"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => onDelete?.(row.expense)}
                          variant="danger"
                        >
                          Delete
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => onEditActivity?.(row.activity)}
                          variant="primary"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => onDeleteActivity?.(row.activity)}
                          variant="danger"
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default ExpenseTable
