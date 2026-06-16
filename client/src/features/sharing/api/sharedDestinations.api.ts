import axios from 'axios'
import travelServiceClient from '../../../api/travelServiceClient'
import type {
  DestinationDto,
  DestinationRequestDto,
} from '../../destinations/types/destination.types'

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

async function runSharedDestinationMutation<T>(
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

export async function createSharedDestination(
  token: string,
  request: DestinationRequestDto,
): Promise<DestinationDto> {
  const response = await runSharedDestinationMutation(() =>
    travelServiceClient.post(`${getSharedBasePath(token)}/destinations`, request),
  )

  return response.data as DestinationDto
}

export async function updateSharedDestination(
  token: string,
  destinationId: number,
  request: DestinationRequestDto,
): Promise<DestinationDto> {
  const response = await runSharedDestinationMutation(() =>
    travelServiceClient.put(
      `${getSharedBasePath(token)}/destinations/${destinationId}`,
      request,
    ),
  )

  return response.data as DestinationDto
}

export async function deleteSharedDestination(
  token: string,
  destinationId: number,
): Promise<void> {
  await runSharedDestinationMutation(() =>
    travelServiceClient.delete(
      `${getSharedBasePath(token)}/destinations/${destinationId}`,
    ),
  )
}
