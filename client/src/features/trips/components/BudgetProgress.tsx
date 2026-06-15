type BudgetProgressProps = {
  budget: number
  isLoading?: boolean
  remaining: number
  spent: number
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
})

function clampPercentage(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(Math.max(value, 0), 100)
}

function BudgetProgress({
  budget,
  isLoading = false,
  remaining,
  spent,
}: BudgetProgressProps) {
  const rawPercentage = budget > 0 ? (spent / budget) * 100 : 0
  const percentage = clampPercentage(rawPercentage)
  const percentageLabel = `${Math.round(percentage)}% of budget used`
  const isOverBudget = remaining <= 0
  const progressColorClassName = isOverBudget ? 'bg-red-500' : 'bg-emerald-500'
  const remainingTextClassName = isOverBudget
    ? 'font-bold text-red-700'
    : 'font-bold text-slate-900'

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="m-0 text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">
            Budget
          </p>
          <p className="m-0 mt-1 text-sm text-slate-500">Spent / total</p>
        </div>
        <div className="text-right">
          {isLoading ? (
            <span className="inline-block h-5 w-32 animate-pulse rounded bg-slate-200" />
          ) : (
            <p className="m-0 text-base font-extrabold text-slate-900">
              {currencyFormatter.format(spent)} / {currencyFormatter.format(budget)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={[
            'h-full rounded-full transition-[width]',
            progressColorClassName,
          ].join(' ')}
          style={{ width: `${isLoading ? 0 : percentage}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        {isLoading ? (
          <span className="inline-block h-4 w-36 animate-pulse rounded bg-slate-200" />
        ) : (
          <span className="font-medium text-slate-600">{percentageLabel}</span>
        )}
        <span className={remainingTextClassName}>
          Remaining {currencyFormatter.format(remaining)}
        </span>
      </div>
    </div>
  )
}

export default BudgetProgress
