import userServiceClient from '../../../api/userServiceClient'
import {
  getEnum,
  getNumber,
  getString,
  isRecord,
} from '../../../utils/dto'
import type { UserRole } from '../../auth/types/auth.types'
import type {
  UpdateUserProfileRequestDto,
  UserProfileDto,
} from '../types/profile.types'

const USER_ROLES = ['Admin', 'User'] as const

function normalizeRole(value: string): UserRole {
  return getEnum(value, USER_ROLES, 'User')
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
