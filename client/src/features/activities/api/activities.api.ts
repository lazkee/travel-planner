import travelServiceClient from '../../../api/travelServiceClient'
import type {
  ActivityDto,
  ActivityRequestDto,
  ActivityStatus,
} from '../types/activity.types'

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

function normalizeStatus(value: string): ActivityStatus {
  return value === 'Reserved' ||
    value === 'Completed' ||
    value === 'Cancelled' ||
    value === 'Planned'
    ? value
    : 'Planned'
}

function normalizeTime(value: string | undefined) {
  if (!value) {
    return undefined
  }

  return value.slice(0, 5)
}

function normalizeActivity(data: unknown): ActivityDto {
  const source = isRecord(data) ? data : {}

  return {
    id: getNumber(source, ['id', 'Id']),
    travelPlanId: getNumber(source, ['travelPlanId', 'TravelPlanId']),
    name: getString(source, ['name', 'Name']),
    date: getString(source, ['date', 'Date']),
    time: normalizeTime(getOptionalString(source, ['time', 'Time'])),
    location: getOptionalString(source, ['location', 'Location']),
    description: getOptionalString(source, ['description', 'Description']),
    estimatedCost: getNumber(source, ['estimatedCost', 'EstimatedCost']),
    status: normalizeStatus(getString(source, ['status', 'Status'])),
  }
}

export async function getActivities(planId: number): Promise<ActivityDto[]> {
  const response = await travelServiceClient.get(
    `/api/travel-plans/${planId}/activities`,
  )
  const activities = Array.isArray(response.data) ? response.data : []

  return activities.map(normalizeActivity)
}

export async function createActivity(
  planId: number,
  request: ActivityRequestDto,
): Promise<ActivityDto> {
  const response = await travelServiceClient.post(
    `/api/travel-plans/${planId}/activities`,
    request,
  )

  return normalizeActivity(response.data)
}

export async function updateActivity(
  planId: number,
  activityId: number,
  request: ActivityRequestDto,
): Promise<ActivityDto> {
  const response = await travelServiceClient.put(
    `/api/travel-plans/${planId}/activities/${activityId}`,
    request,
  )

  return normalizeActivity(response.data)
}

export async function deleteActivity(
  planId: number,
  activityId: number,
): Promise<void> {
  await travelServiceClient.delete(
    `/api/travel-plans/${planId}/activities/${activityId}`,
  )
}
