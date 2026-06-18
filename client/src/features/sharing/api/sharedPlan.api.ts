import axios from 'axios'
import travelServiceClient from '../../../api/travelServiceClient'
import {
  getNumber,
  getOptionalString,
  getRecordValue,
  getString,
  isRecord,
  type UnknownRecord,
} from '../../../utils/dto'
import { normalizeActivity } from '../../activities/api/activities.api'
import { normalizeChecklistItem } from '../../checklist/api/checklist.api'
import { normalizeDestination } from '../../destinations/api/destinations.api'
import { normalizeExpense } from '../../expenses/api/expenses.api'
import type {
  BudgetCategorySummaryDto,
  BudgetSummaryDto,
} from '../../trips/types/budgetSummary.types'
import type {
  TravelPlanDto,
  TravelPlanRequestDto,
} from '../../trips/types/travelPlan.types'
import { READONLY_MUTATION_MESSAGE } from '../constants'
import { normalizeAccessLevel } from './shares.api'
import type { SharedTravelPlanDto } from '../types/sharedPlan.types'

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
      throw new Error(getResponseMessage(error) || READONLY_MUTATION_MESSAGE)
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
