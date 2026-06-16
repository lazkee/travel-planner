import axios from 'axios'
import travelServiceClient from '../../../api/travelServiceClient'
import type { ActivityStatus } from '../../activities/types/activity.types'
import type { ExpenseCategory } from '../../expenses/types/expense.types'
import type {
  BudgetCategorySummaryDto,
  BudgetSummaryDto,
} from '../../trips/types/budgetSummary.types'
import type {
  TravelPlanDto,
  TravelPlanRequestDto,
} from '../../trips/types/travelPlan.types'
import type { ShareAccessLevel } from '../types/share.types'
import type { SharedTravelPlanDto } from '../types/sharedPlan.types'

type UnknownRecord = Record<string, unknown>
type SharedTravelPlanErrorKind = 'not-found' | 'expired'

export class SharedTravelPlanError extends Error {
  kind: SharedTravelPlanErrorKind

  constructor(kind: SharedTravelPlanErrorKind, message: string) {
    super(message)
    this.kind = kind
  }
}

function getSharedBasePath(token: string) {
  return `/api/shared/${encodeURIComponent(token)}`
}

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

function getBoolean(source: UnknownRecord, keys: string[]) {
  const value = getRecordValue(source, keys)

  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }

  return false
}

function getArray(source: UnknownRecord, keys: string[]) {
  const value = getRecordValue(source, keys)

  return Array.isArray(value) ? value : []
}

function getResponseMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return ''
  }

  const data = error.response?.data

  return isRecord(data) && typeof data.message === 'string' ? data.message : ''
}

function normalizeAccessLevel(value: string): ShareAccessLevel {
  return value === 'Edit' ? 'Edit' : 'View'
}

function normalizeActivityStatus(value: string): ActivityStatus {
  return value === 'Reserved' ||
    value === 'Completed' ||
    value === 'Cancelled' ||
    value === 'Planned'
    ? value
    : 'Planned'
}

function normalizeExpenseCategory(value: string): ExpenseCategory {
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

function normalizeDestination(data: unknown) {
  const source = isRecord(data) ? data : {}

  return {
    id: getNumber(source, ['id', 'Id']),
    travelPlanId: getNumber(source, ['travelPlanId', 'TravelPlanId']),
    name: getString(source, ['name', 'Name']),
    location: getString(source, ['location', 'Location']),
    arrivalDate: getString(source, ['arrivalDate', 'ArrivalDate']),
    departureDate: getString(source, ['departureDate', 'DepartureDate']),
    description: getOptionalString(source, ['description', 'Description']),
  }
}

function normalizeActivity(data: unknown) {
  const source = isRecord(data) ? data : {}
  const time = getOptionalString(source, ['time', 'Time'])

  return {
    id: getNumber(source, ['id', 'Id']),
    travelPlanId: getNumber(source, ['travelPlanId', 'TravelPlanId']),
    name: getString(source, ['name', 'Name']),
    date: getString(source, ['date', 'Date']),
    time: time ? time.slice(0, 5) : undefined,
    location: getOptionalString(source, ['location', 'Location']),
    description: getOptionalString(source, ['description', 'Description']),
    estimatedCost: getNumber(source, ['estimatedCost', 'EstimatedCost']),
    status: normalizeActivityStatus(getString(source, ['status', 'Status'])),
  }
}

function normalizeExpense(data: unknown) {
  const source = isRecord(data) ? data : {}

  return {
    id: getNumber(source, ['id', 'Id']),
    travelPlanId: getNumber(source, ['travelPlanId', 'TravelPlanId']),
    name: getString(source, ['name', 'Name']),
    category: normalizeExpenseCategory(getString(source, ['category', 'Category'])),
    amount: getNumber(source, ['amount', 'Amount']),
    date: getString(source, ['date', 'Date']),
    description: getOptionalString(source, ['description', 'Description']),
  }
}

function normalizeChecklistItem(data: unknown) {
  const source = isRecord(data) ? data : {}

  return {
    id: getNumber(source, ['id', 'Id']),
    travelPlanId: getNumber(source, ['travelPlanId', 'TravelPlanId']),
    text: getString(source, ['text', 'Text']),
    isCompleted: getBoolean(source, ['isCompleted', 'IsCompleted']),
  }
}

function normalizeBudgetCategory(data: unknown): BudgetCategorySummaryDto {
  const source = isRecord(data) ? data : {}

  return {
    category: getString(source, ['category', 'Category']),
    totalAmount: getNumber(source, ['totalAmount', 'TotalAmount']),
  }
}

function normalizeBudgetSummary(data: unknown): BudgetSummaryDto {
  const source = isRecord(data) ? data : {}

  return {
    travelPlanId: getNumber(source, ['travelPlanId', 'TravelPlanId']),
    budget: getNumber(source, ['budget', 'Budget']),
    totalExpenses: getNumber(source, ['totalExpenses', 'TotalExpenses']),
    remainingBudget: getNumber(source, ['remainingBudget', 'RemainingBudget']),
    categories: getArray(source, ['categories', 'Categories']).map(
      normalizeBudgetCategory,
    ),
  }
}

function normalizeSharedTravelPlan(data: unknown): SharedTravelPlanDto {
  const source = isRecord(data) ? data : {}

  return {
    id: getNumber(source, ['id', 'Id']),
    name: getString(source, ['name', 'Name']),
    description: getOptionalString(source, ['description', 'Description']),
    startDate: getString(source, ['startDate', 'StartDate']),
    endDate: getString(source, ['endDate', 'EndDate']),
    budget: getNumber(source, ['budget', 'Budget']),
    notes: getOptionalString(source, ['notes', 'Notes']),
    createdAt: getString(source, ['createdAt', 'CreatedAt']),
    destinations: getArray(source, ['destinations', 'Destinations']).map(
      normalizeDestination,
    ),
    activities: getArray(source, ['activities', 'Activities']).map(
      normalizeActivity,
    ),
    expenses: getArray(source, ['expenses', 'Expenses']).map(normalizeExpense),
    checklistItems: getArray(source, [
      'checklistItems',
      'ChecklistItems',
    ]).map(normalizeChecklistItem),
    budgetSummary: normalizeBudgetSummary(
      getRecordValue(source, ['budgetSummary', 'BudgetSummary']),
    ),
    accessLevel: normalizeAccessLevel(
      getString(source, ['accessLevel', 'AccessLevel']),
    ),
    expiresAtUtc: getString(source, ['expiresAtUtc', 'ExpiresAtUtc']),
  }
}

async function runSharedPlanMutation<T>(
  request: () => Promise<T>,
): Promise<T> {
  try {
    return await request()
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new Error(
        getResponseMessage(error) || 'This share link does not allow editing.',
      )
    }

    throw error
  }
}

export function isSharedTravelPlanNotFoundError(error: unknown) {
  return error instanceof SharedTravelPlanError && error.kind === 'not-found'
}

export async function getSharedTravelPlan(
  token: string,
): Promise<SharedTravelPlanDto> {
  try {
    const response = await travelServiceClient.get(
      `${getSharedBasePath(token)}/travel-plan`,
    )

    return normalizeSharedTravelPlan(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new SharedTravelPlanError(
          'not-found',
          getResponseMessage(error) || 'Shared trip not found.',
        )
      }

      if (error.response?.status === 410) {
        throw new SharedTravelPlanError(
          'expired',
          getResponseMessage(error) || 'Share link expired.',
        )
      }
    }

    throw error
  }
}

export async function updateSharedTravelPlan(
  token: string,
  request: TravelPlanRequestDto,
): Promise<TravelPlanDto> {
  const response = await runSharedPlanMutation(() =>
    travelServiceClient.put(`${getSharedBasePath(token)}/travel-plan`, request),
  )

  return response.data as TravelPlanDto
}
