import axios from 'axios'
import travelServiceClient from '../../../api/travelServiceClient'
import { isRecord } from '../../../utils/dto'
import { normalizeDestination } from '../../destinations/api/destinations.api'
import { READONLY_MUTATION_MESSAGE } from '../constants'
import type {
  DestinationDto,
  DestinationRequestDto,
} from '../../destinations/types/destination.types'

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

async function runSharedDestinationMutation<T>(
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

export async function createSharedDestination(
  token: string,
  request: DestinationRequestDto,
): Promise<DestinationDto> {
  const response = await runSharedDestinationMutation(() =>
    travelServiceClient.post(`${getSharedBasePath(token)}/destinations`, request),
  )

  return normalizeDestination(response.data)
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

  return normalizeDestination(response.data)
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
