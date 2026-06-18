import travelServiceClient from '../../../api/travelServiceClient'
import {
  getBoolean,
  getNumber,
  getString,
  isRecord,
} from '../../../utils/dto'
import type {
  ChecklistItemDto,
  ChecklistItemRequestDto,
} from '../types/checklist.types'

export function normalizeChecklistItem(data: unknown): ChecklistItemDto {
  const source = isRecord(data) ? data : {}

  return {
    id: getNumber(source, ['id', 'Id']),
    travelPlanId: getNumber(source, ['travelPlanId', 'TravelPlanId']),
    text: getString(source, ['text', 'Text']),
    isCompleted: getBoolean(source, ['isCompleted', 'IsCompleted']),
  }
}

export async function getChecklistItems(
  planId: number,
): Promise<ChecklistItemDto[]> {
  const response = await travelServiceClient.get(
    `/api/travel-plans/${planId}/checklist-items`,
  )
  const items = Array.isArray(response.data) ? response.data : []

  return items.map(normalizeChecklistItem)
}

export async function createChecklistItem(
  planId: number,
  request: ChecklistItemRequestDto,
): Promise<ChecklistItemDto> {
  const response = await travelServiceClient.post(
    `/api/travel-plans/${planId}/checklist-items`,
    request,
  )

  return normalizeChecklistItem(response.data)
}

export async function updateChecklistItem(
  planId: number,
  itemId: number,
  request: ChecklistItemRequestDto,
): Promise<ChecklistItemDto> {
  const response = await travelServiceClient.put(
    `/api/travel-plans/${planId}/checklist-items/${itemId}`,
    request,
  )

  return normalizeChecklistItem(response.data)
}

export async function deleteChecklistItem(
  planId: number,
  itemId: number,
): Promise<void> {
  await travelServiceClient.delete(
    `/api/travel-plans/${planId}/checklist-items/${itemId}`,
  )
}
