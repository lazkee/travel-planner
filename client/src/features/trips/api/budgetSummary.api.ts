import travelServiceClient from '../../../api/travelServiceClient'
import {
  getNumber,
  getRecordValue,
  getString,
  isRecord,
} from '../../../utils/dto'
import type {
  BudgetCategorySummaryDto,
  BudgetSummaryDto,
} from '../types/budgetSummary.types'

function normalizeCategory(data: unknown): BudgetCategorySummaryDto {
  const source = isRecord(data) ? data : {}

  return {
    category: getString(source, ['category', 'Category']),
    totalAmount: getNumber(source, ['totalAmount', 'TotalAmount']),
  }
}

function normalizeBudgetSummary(data: unknown): BudgetSummaryDto {
  const source = isRecord(data) ? data : {}
  const categories = getRecordValue(source, ['categories', 'Categories'])

  return {
    travelPlanId: getNumber(source, ['travelPlanId', 'TravelPlanId']),
    budget: getNumber(source, ['budget', 'Budget']),
    totalExpenses: getNumber(source, ['totalExpenses', 'TotalExpenses']),
    remainingBudget: getNumber(source, ['remainingBudget', 'RemainingBudget']),
    categories: Array.isArray(categories) ? categories.map(normalizeCategory) : [],
  }
}

export async function getBudgetSummary(
  planId: number,
): Promise<BudgetSummaryDto> {
  const response = await travelServiceClient.get(
    `/api/travel-plans/${planId}/budget-summary`,
  )

  return normalizeBudgetSummary(response.data)
}
