import { formatCurrency } from '../../../utils/format'
import type {
  ExpenseCategory,
  ExpenseFilter,
} from '../types/expense.types'
import { expenseCategories } from '../types/expense.types'

type BudgetCategoryBreakdownProps = {
  categoryAmounts: Record<ExpenseCategory, number>
  selectedFilter: ExpenseFilter
  usedBudget: number
  onSelect: (filter: ExpenseFilter) => void
}

function getPercentage(amount: number, total: number) {
  if (total <= 0) {
    return 0
  }

  return Math.min(Math.max((amount / total) * 100, 0), 100)
}

function CategoryButton({
  amount,
  filter,
  isSelected,
  label,
  percentage,
  onSelect,
}: {
  amount: number
  filter: ExpenseFilter
  isSelected: boolean
  label: string
  percentage: number
  onSelect: (filter: ExpenseFilter) => void
}) {
  return (
    <button
      className={[
        'rounded-lg border p-3 text-left transition',
        isSelected
          ? 'border-blue-300 bg-blue-50'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
      ].join(' ')}
      onClick={() => onSelect(filter)}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="m-0 text-sm font-extrabold text-slate-900">{label}</p>
          <p className="m-0 mt-1 text-sm text-slate-500">
            {formatCurrency(amount)}
          </p>
        </div>
        <span className="text-sm font-bold text-slate-600">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </button>
  )
}

function BudgetCategoryBreakdown({
  categoryAmounts,
  onSelect,
  selectedFilter,
  usedBudget,
}: BudgetCategoryBreakdownProps) {
  return (
    <section className="grid gap-3">
      <div>
        <h3 className="m-0 text-lg font-bold text-slate-900">
          Category breakdown
        </h3>
        <p className="m-0 mt-1 text-sm text-slate-500">
          Total planned cost: {formatCurrency(usedBudget)}.
          Percentages show each category share.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <CategoryButton
          amount={usedBudget}
          filter="All"
          isSelected={selectedFilter === 'All'}
          label="All"
          onSelect={onSelect}
          percentage={usedBudget > 0 ? 100 : 0}
        />
        {expenseCategories.map((category) => {
          const amount = categoryAmounts[category]

          return (
            <CategoryButton
              amount={amount}
              filter={category}
              isSelected={selectedFilter === category}
              key={category}
              label={category}
              onSelect={onSelect}
              percentage={getPercentage(amount, usedBudget)}
            />
          )
        })}
      </div>
    </section>
  )
}

export default BudgetCategoryBreakdown
