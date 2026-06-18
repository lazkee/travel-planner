import travelServiceClient from '../../../api/travelServiceClient'
import {
  getEnum,
  getNumber,
  getOptionalString,
  getString,
  isRecord,
} from '../../../utils/dto'
import type {
  ActivityDto,
  ActivityRequestDto,
  ActivityStatus,
} from '../types/activity.types'

const ACTIVITY_STATUSES = ['Planned', 'Reserved', 'Completed', 'Cancelled'] as const

function normalizeStatus(value: string): ActivityStatus {
  return getEnum(value, ACTIVITY_STATUSES, 'Planned')
}

function normalizeTime(value: string | undefined) {
  if (!value) {
    return undefined
  }

  return value.slice(0, 5)
}

export function normalizeActivity(data: unknown): ActivityDto {
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
