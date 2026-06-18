import axios from 'axios'
import { isRecord } from '../utils/dto'

type ApiErrorData = Record<string, unknown>

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string')
}

function getValidationMessages(data: unknown): string | null {
  if (!isRecord(data)) {
    return null
  }

  const source = isRecord(data.errors) ? data.errors : (data as ApiErrorData)
  const messages = Object.values(source).flatMap(getStringArray)

  return messages.length > 0 ? messages.join(' ') : null
}

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message) {
      return error.message
    }

    return 'Something went wrong.'
  }

  if (!error.response) {
    return 'Unable to connect to the server.'
  }

  const data = error.response.data

  if (isRecord(data) && typeof data.message === 'string') {
    return data.message
  }

  const validationMessage = getValidationMessages(data)

  if (validationMessage) {
    return validationMessage
  }

  return 'Something went wrong.'
}
