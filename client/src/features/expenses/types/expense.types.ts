export type ExpenseCategory =
  | 'Accommodation'
  | 'Transport'
  | 'Food'
  | 'Activities'
  | 'Shopping'
  | 'Tickets'
  | 'Other'

export interface ExpenseDto {
  id: number
  travelPlanId: number
  name: string
  category: ExpenseCategory
  amount: number
  date: string
  description?: string
}

export interface ExpenseRequestDto {
  name: string
  category: ExpenseCategory
  amount: number
  date: string
  description?: string
}

export const expenseCategories: ExpenseCategory[] = [
  'Accommodation',
  'Transport',
  'Food',
  'Activities',
  'Shopping',
  'Tickets',
  'Other',
]

export type ExpenseFilter = 'All' | ExpenseCategory
