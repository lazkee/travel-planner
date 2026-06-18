import travelServiceClient from '../../../api/travelServiceClient'
import {
  getEnum,
  getNumber,
  getOptionalString,
  getString,
  isRecord,
} from '../../../utils/dto'
import type {
  ExpenseCategory,
  ExpenseDto,
  ExpenseRequestDto,
} from '../types/expense.types'

const EXPENSE_CATEGORIES = [
  'Accommodation',
  'Transport',
  'Food',
  'Activities',
  'Shopping',
  'Tickets',
  'Other',
] as const

function normalizeCategory(value: string): ExpenseCategory {
  return getEnum(value, EXPENSE_CATEGORIES, 'Other')
}

export function normalizeExpense(data: unknown): ExpenseDto {
  const source = isRecord(data) ? data : {}

  return {
    id: getNumber(source, ['id', 'Id']),
    travelPlanId: getNumber(source, ['travelPlanId', 'TravelPlanId']),
    name: getString(source, ['name', 'Name']),
    category: normalizeCategory(getString(source, ['category', 'Category'])),
    amount: getNumber(source, ['amount', 'Amount']),
    date: getString(source, ['date', 'Date']),
    description: getOptionalString(source, ['description', 'Description']),
  }
}

export async function getExpenses(planId: number): Promise<ExpenseDto[]> {
  const response = await travelServiceClient.get(
    `/api/travel-plans/${planId}/expenses`,
  )
  const expenses = Array.isArray(response.data) ? response.data : []

  return expenses.map(normalizeExpense)
}

export async function createExpense(
  planId: number,
  request: ExpenseRequestDto,
): Promise<ExpenseDto> {
  const response = await travelServiceClient.post(
    `/api/travel-plans/${planId}/expenses`,
    request,
  )

  return normalizeExpense(response.data)
}

export async function updateExpense(
  planId: number,
  expenseId: number,
  request: ExpenseRequestDto,
): Promise<ExpenseDto> {
  const response = await travelServiceClient.put(
    `/api/travel-plans/${planId}/expenses/${expenseId}`,
    request,
  )

  return normalizeExpense(response.data)
}

export async function deleteExpense(
  planId: number,
  expenseId: number,
): Promise<void> {
  await travelServiceClient.delete(
    `/api/travel-plans/${planId}/expenses/${expenseId}`,
  )
}
