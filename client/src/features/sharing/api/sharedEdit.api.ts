import axios from 'axios'
import travelServiceClient from '../../../api/travelServiceClient'
import type {
  ActivityDto,
  ActivityRequestDto,
} from '../../activities/types/activity.types'
import type {
  ChecklistItemDto,
  ChecklistItemRequestDto,
} from '../../checklist/types/checklist.types'
import type {
  DestinationDto,
  DestinationRequestDto,
} from '../../destinations/types/destination.types'
import type {
  ExpenseDto,
  ExpenseRequestDto,
} from '../../expenses/types/expense.types'
import type {
  TravelPlanDto,
  TravelPlanRequestDto,
} from '../../trips/types/travelPlan.types'

function getSharedBasePath(token: string) {
  return `/api/shared/${encodeURIComponent(token)}`
}

async function runSharedEditRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request()
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new Error('This share link does not allow editing.')
    }

    throw error
  }
}

export async function updateSharedTravelPlan(
  token: string,
  request: TravelPlanRequestDto,
): Promise<TravelPlanDto> {
  const response = await runSharedEditRequest(() =>
    travelServiceClient.put(`${getSharedBasePath(token)}/travel-plan`, request),
  )

  return response.data as TravelPlanDto
}

export async function createSharedDestination(
  token: string,
  request: DestinationRequestDto,
): Promise<DestinationDto> {
  const response = await runSharedEditRequest(() =>
    travelServiceClient.post(`${getSharedBasePath(token)}/destinations`, request),
  )

  return response.data as DestinationDto
}

export async function updateSharedDestination(
  token: string,
  destinationId: number,
  request: DestinationRequestDto,
): Promise<DestinationDto> {
  const response = await runSharedEditRequest(() =>
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
  await runSharedEditRequest(() =>
    travelServiceClient.delete(
      `${getSharedBasePath(token)}/destinations/${destinationId}`,
    ),
  )
}

export async function createSharedActivity(
  token: string,
  request: ActivityRequestDto,
): Promise<ActivityDto> {
  const response = await runSharedEditRequest(() =>
    travelServiceClient.post(`${getSharedBasePath(token)}/activities`, request),
  )

  return response.data as ActivityDto
}

export async function updateSharedActivity(
  token: string,
  activityId: number,
  request: ActivityRequestDto,
): Promise<ActivityDto> {
  const response = await runSharedEditRequest(() =>
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
  await runSharedEditRequest(() =>
    travelServiceClient.delete(
      `${getSharedBasePath(token)}/activities/${activityId}`,
    ),
  )
}

export async function createSharedExpense(
  token: string,
  request: ExpenseRequestDto,
): Promise<ExpenseDto> {
  const response = await runSharedEditRequest(() =>
    travelServiceClient.post(`${getSharedBasePath(token)}/expenses`, request),
  )

  return response.data as ExpenseDto
}

export async function updateSharedExpense(
  token: string,
  expenseId: number,
  request: ExpenseRequestDto,
): Promise<ExpenseDto> {
  const response = await runSharedEditRequest(() =>
    travelServiceClient.put(
      `${getSharedBasePath(token)}/expenses/${expenseId}`,
      request,
    ),
  )

  return response.data as ExpenseDto
}

export async function deleteSharedExpense(
  token: string,
  expenseId: number,
): Promise<void> {
  await runSharedEditRequest(() =>
    travelServiceClient.delete(`${getSharedBasePath(token)}/expenses/${expenseId}`),
  )
}

export async function createSharedChecklistItem(
  token: string,
  request: ChecklistItemRequestDto,
): Promise<ChecklistItemDto> {
  const response = await runSharedEditRequest(() =>
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
  const response = await runSharedEditRequest(() =>
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
  await runSharedEditRequest(() =>
    travelServiceClient.delete(
      `${getSharedBasePath(token)}/checklist-items/${itemId}`,
    ),
  )
}
