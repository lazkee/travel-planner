import travelServiceClient from '../../../api/travelServiceClient'
import type {
  ChecklistItemDto,
  ChecklistItemRequestDto,
} from '../types/checklist.types'

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

function getBoolean(source: UnknownRecord, keys: string[]) {
  const value = getRecordValue(source, keys)

  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }

  return false
}

function normalizeChecklistItem(data: unknown): ChecklistItemDto {
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
