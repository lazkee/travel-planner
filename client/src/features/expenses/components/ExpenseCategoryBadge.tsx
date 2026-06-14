import type { ExpenseCategory } from '../types/expense.types'

type ExpenseCategoryBadgeProps = {
  category: ExpenseCategory
}

const categoryClassNames: Record<ExpenseCategory, string> = {
  Accommodation: 'bg-indigo-50 text-indigo-700',
  Transport: 'bg-sky-50 text-sky-700',
  Food: 'bg-orange-50 text-orange-700',
  Activities: 'bg-emerald-50 text-emerald-700',
  Shopping: 'bg-pink-50 text-pink-700',
  Tickets: 'bg-amber-50 text-amber-700',
  Other: 'bg-slate-100 text-slate-600',
}

function ExpenseCategoryBadge({ category }: ExpenseCategoryBadgeProps) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold',
        categoryClassNames[category],
      ].join(' ')}
    >
      {category}
    </span>
  )
}

export default ExpenseCategoryBadge
