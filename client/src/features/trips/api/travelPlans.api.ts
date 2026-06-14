import travelServiceClient from '../../../api/travelServiceClient'
import type {
  TravelPlanDto,
  TravelPlanRequestDto,
} from '../types/travelPlan.types'

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

function normalizeTravelPlan(data: unknown): TravelPlanDto {
  const source = isRecord(data) ? data : {}

  return {
    id: getNumber(source, ['id', 'Id']),
    userId: getNumber(source, ['userId', 'UserId']),
    name: getString(source, ['name', 'Name']),
    description: getOptionalString(source, ['description', 'Description']),
    startDate: getString(source, ['startDate', 'StartDate']),
    endDate: getString(source, ['endDate', 'EndDate']),
    budget: getNumber(source, ['budget', 'Budget']),
    notes: getOptionalString(source, ['notes', 'Notes']),
    createdAt: getString(source, ['createdAt', 'CreatedAt']),
  }
}

export async function getTravelPlans(): Promise<TravelPlanDto[]> {
  const response = await travelServiceClient.get('/api/travel-plans')
  const plans = Array.isArray(response.data) ? response.data : []

  return plans.map(normalizeTravelPlan)
}

export async function createTravelPlan(
  request: TravelPlanRequestDto,
): Promise<TravelPlanDto> {
  const response = await travelServiceClient.post('/api/travel-plans', request)

  return normalizeTravelPlan(response.data)
}

export async function updateTravelPlan(
  id: number,
  request: TravelPlanRequestDto,
): Promise<TravelPlanDto> {
  const response = await travelServiceClient.put(
    `/api/travel-plans/${id}`,
    request,
  )

  return normalizeTravelPlan(response.data)
}

export async function deleteTravelPlan(id: number): Promise<void> {
  await travelServiceClient.delete(`/api/travel-plans/${id}`)
}
