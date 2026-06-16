import userServiceClient from '../../../api/userServiceClient'
import type { UserRole } from '../../auth/types/auth.types'
import type {
  UpdateUserProfileRequestDto,
  UserProfileDto,
} from '../types/profile.types'

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

function normalizeRole(value: string): UserRole {
  return value === 'Admin' ? 'Admin' : 'User'
}

function normalizeUserProfile(data: unknown): UserProfileDto {
  const source = isRecord(data) ? data : {}

  return {
    id: getNumber(source, ['id', 'Id']),
    name: getString(source, ['name', 'Name']),
    email: getString(source, ['email', 'Email']),
    role: normalizeRole(getString(source, ['role', 'Role'])),
    createdAt: getString(source, ['createdAt', 'CreatedAt']),
  }
}

export async function getCurrentUserProfile(): Promise<UserProfileDto> {
  const response = await userServiceClient.get('/api/users/me')

  return normalizeUserProfile(response.data)
}

export async function updateCurrentUserProfile(
  request: UpdateUserProfileRequestDto,
): Promise<UserProfileDto> {
  const response = await userServiceClient.put('/api/users/me', request)

  return normalizeUserProfile(response.data)
}

export async function deleteCurrentUserProfile(): Promise<void> {
  await userServiceClient.delete('/api/users/me')
}
