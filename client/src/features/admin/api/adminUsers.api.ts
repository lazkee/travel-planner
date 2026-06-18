import userServiceClient from '../../../api/userServiceClient'
import {
  getEnum,
  getNumber,
  getString,
  isRecord,
} from '../../../utils/dto'
import type {
  AdminUpdateUserRequestDto,
  AdminUpdateUserRoleRequestDto,
  AdminUserDto,
  AdminUserRole,
} from '../types/adminUser.types'

const ADMIN_USER_ROLES = ['Admin', 'User'] as const

function normalizeRole(value: string): AdminUserRole {
  return getEnum(value, ADMIN_USER_ROLES, 'User')
}

function normalizeAdminUser(data: unknown): AdminUserDto {
  const source = isRecord(data) ? data : {}

  return {
    id: getNumber(source, ['id', 'Id']),
    name: getString(source, ['name', 'Name']),
    email: getString(source, ['email', 'Email']),
    role: normalizeRole(getString(source, ['role', 'Role'])),
    createdAt: getString(source, ['createdAt', 'CreatedAt']),
  }
}

export async function getAdminUsers(): Promise<AdminUserDto[]> {
  const response = await userServiceClient.get('/api/admin/users')
  const users = Array.isArray(response.data) ? response.data : []

  return users.map(normalizeAdminUser)
}

export async function updateAdminUserRole(
  id: number,
  role: AdminUserRole,
): Promise<AdminUserDto> {
  const request: AdminUpdateUserRoleRequestDto = { role }
  const response = await userServiceClient.put(
    `/api/admin/users/${id}/role`,
    request,
  )

  return normalizeAdminUser(response.data)
}

export async function updateAdminUser(
  id: number,
  request: AdminUpdateUserRequestDto,
): Promise<AdminUserDto> {
  const response = await userServiceClient.put(`/api/admin/users/${id}`, request)

  return normalizeAdminUser(response.data)
}

export async function deleteAdminUser(id: number): Promise<void> {
  await userServiceClient.delete(`/api/admin/users/${id}`)
}
