import axios from 'axios'
import travelServiceClient from '../../../api/travelServiceClient'
import type {
  ExpenseDto,
  ExpenseRequestDto,
} from '../../expenses/types/expense.types'

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

async function runSharedExpenseMutation<T>(
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

export async function createSharedExpense(
  token: string,
  request: ExpenseRequestDto,
): Promise<ExpenseDto> {
  const response = await runSharedExpenseMutation(() =>
    travelServiceClient.post(`${getSharedBasePath(token)}/expenses`, request),
  )

  return response.data as ExpenseDto
}

export async function updateSharedExpense(
  token: string,
  expenseId: number,
  request: ExpenseRequestDto,
): Promise<ExpenseDto> {
  const response = await runSharedExpenseMutation(() =>
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
  await runSharedExpenseMutation(() =>
    travelServiceClient.delete(`${getSharedBasePath(token)}/expenses/${expenseId}`),
  )
}
