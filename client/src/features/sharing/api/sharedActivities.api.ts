import axios from 'axios'
import travelServiceClient from '../../../api/travelServiceClient'
import { isRecord } from '../../../utils/dto'
import { normalizeActivity } from '../../activities/api/activities.api'
import { READONLY_MUTATION_MESSAGE } from '../constants'
import type {
  ActivityDto,
  ActivityRequestDto,
} from '../../activities/types/activity.types'

function getSharedBasePath(token: string) {
  return `/api/shared/${encodeURIComponent(token)}`
}

function getResponseMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return ''
  }

  const data = error.response?.data

  return isRecord(data) && typeof data.message === 'string' ? data.message : ''
}

async function runSharedActivityMutation<T>(
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

export async function createSharedActivity(
  token: string,
  request: ActivityRequestDto,
): Promise<ActivityDto> {
  const response = await runSharedActivityMutation(() =>
    travelServiceClient.post(`${getSharedBasePath(token)}/activities`, request),
  )

  return normalizeActivity(response.data)
}

export async function updateSharedActivity(
  token: string,
  activityId: number,
  request: ActivityRequestDto,
): Promise<ActivityDto> {
  const response = await runSharedActivityMutation(() =>
    travelServiceClient.put(
      `${getSharedBasePath(token)}/activities/${activityId}`,
      request,
    ),
  )

  return normalizeActivity(response.data)
}

export async function deleteSharedActivity(
  token: string,
  activityId: number,
): Promise<void> {
  await runSharedActivityMutation(() =>
    travelServiceClient.delete(
      `${getSharedBasePath(token)}/activities/${activityId}`,
    ),
  )
}
