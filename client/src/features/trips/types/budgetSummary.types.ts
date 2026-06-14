export interface BudgetCategorySummaryDto {
  category: string
  totalAmount: number
}

export interface BudgetSummaryDto {
  travelPlanId: number
  budget: number
  totalExpenses: number
  remainingBudget: number
  categories: BudgetCategorySummaryDto[]
}
