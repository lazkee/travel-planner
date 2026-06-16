import axios from 'axios'
import travelServiceClient from '../../../api/travelServiceClient'
import type {
  ActivityDto,
  ActivityRequestDto,
} from '../../activities/types/activity.types'

type UnknownRecord = Record<string, unknown>

function getSharedBasePath(token: string) {
  return `/api/shared/${encodeURIComponent(token)}`
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
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
      throw new Error(
        getResponseMessage(error) || 'This share link does not allow editing.',
      )
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

  return response.data as ActivityDto
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

  return response.data as ActivityDto
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
