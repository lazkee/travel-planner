import travelServiceClient from '../../../api/travelServiceClient'
import {
  getNumber,
  getOptionalString,
  getString,
  isRecord,
} from '../../../utils/dto'
import type {
  DestinationDto,
  DestinationRequestDto,
} from '../types/destination.types'

export function normalizeDestination(data: unknown): DestinationDto {
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
