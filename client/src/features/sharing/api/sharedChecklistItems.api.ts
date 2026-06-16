import axios from 'axios'
import travelServiceClient from '../../../api/travelServiceClient'
import type {
  ChecklistItemDto,
  ChecklistItemRequestDto,
} from '../../checklist/types/checklist.types'

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

async function runSharedChecklistItemMutation<T>(
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

export async function createSharedChecklistItem(
  token: string,
  request: ChecklistItemRequestDto,
): Promise<ChecklistItemDto> {
  const response = await runSharedChecklistItemMutation(() =>
    travelServiceClient.post(
      `${getSharedBasePath(token)}/checklist-items`,
      request,
    ),
  )

  return response.data as ChecklistItemDto
}

export async function updateSharedChecklistItem(
  token: string,
  itemId: number,
  request: ChecklistItemRequestDto,
): Promise<ChecklistItemDto> {
  const response = await runSharedChecklistItemMutation(() =>
    travelServiceClient.put(
      `${getSharedBasePath(token)}/checklist-items/${itemId}`,
      request,
    ),
  )

  return response.data as ChecklistItemDto
}

export async function deleteSharedChecklistItem(
  token: string,
  itemId: number,
): Promise<void> {
  await runSharedChecklistItemMutation(() =>
    travelServiceClient.delete(
      `${getSharedBasePath(token)}/checklist-items/${itemId}`,
    ),
  )
}
