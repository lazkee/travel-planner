import travelServiceClient from '../../../api/travelServiceClient'
import type {
  DestinationDto,
  DestinationRequestDto,
} from '../types/destination.types'

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

function normalizeDestination(data: unknown): DestinationDto {
  const source = isRecord(data) ? data : {}

  return {
    id: getNumber(source, ['id', 'Id']),
    travelPlanId: getNumber(source, ['travelPlanId', 'TravelPlanId']),
    name: getString(source, ['name', 'Name']),
    location: getString(source, ['location', 'Location']),
    arrivalDate: getString(source, ['arrivalDate', 'ArrivalDate']),
    departureDate: getString(source, ['departureDate', 'DepartureDate']),
    description: getOptionalString(source, ['description', 'Description']),
  }
}

export async function getDestinations(
  planId: number,
): Promise<DestinationDto[]> {
  const response = await travelServiceClient.get(
    `/api/travel-plans/${planId}/destinations`,
  )
  const destinations = Array.isArray(response.data) ? response.data : []

  return destinations.map(normalizeDestination)
}

export async function createDestination(
  planId: number,
  request: DestinationRequestDto,
): Promise<DestinationDto> {
  const response = await travelServiceClient.post(
    `/api/travel-plans/${planId}/destinations`,
    request,
  )

  return normalizeDestination(response.data)
}

export async function updateDestination(
  planId: number,
  destinationId: number,
  request: DestinationRequestDto,
): Promise<DestinationDto> {
  const response = await travelServiceClient.put(
    `/api/travel-plans/${planId}/destinations/${destinationId}`,
    request,
  )

  return normalizeDestination(response.data)
}

export async function deleteDestination(
  planId: number,
  destinationId: number,
): Promise<void> {
  await travelServiceClient.delete(
    `/api/travel-plans/${planId}/destinations/${destinationId}`,
  )
}
