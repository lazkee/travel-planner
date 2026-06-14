import travelServiceClient from '../../../api/travelServiceClient'
import type {
  BudgetCategorySummaryDto,
  BudgetSummaryDto,
} from '../types/budgetSummary.types'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function getRecordValue(source: UnknownRecord, keys: string[]): unknown {
  return keys.map((key) => source[key]).find((value) => value !== undefined)
}

function getNumber(source: UnknownRecord, keys: string[]) {
  const value = getRecordValue(source, keys)

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const parsedValue = Number(value)

    return Number.isFinite(parsedValue) ? parsedValue : 0
  }

  return 0
}

function getString(source: UnknownRecord, keys: string[]) {
  const value = getRecordValue(source, keys)

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return ''
}

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
