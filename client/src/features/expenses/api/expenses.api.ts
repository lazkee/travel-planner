import travelServiceClient from '../../../api/travelServiceClient'
import type {
  ExpenseCategory,
  ExpenseDto,
  ExpenseRequestDto,
} from '../types/expense.types'

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

  return typeof value === 'string' ? value : ''
}

function getOptionalString(source: UnknownRecord, keys: string[]) {
  const value = getString(source, keys).trim()

  return value || undefined
}

function normalizeCategory(value: string): ExpenseCategory {
  return value === 'Accommodation' ||
    value === 'Transport' ||
    value === 'Food' ||
    value === 'Activities' ||
    value === 'Shopping' ||
    value === 'Tickets' ||
    value === 'Other'
    ? value
    : 'Other'
}

function normalizeExpense(data: unknown): ExpenseDto {
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
