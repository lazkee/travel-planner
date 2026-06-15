import userServiceClient from '../../../api/userServiceClient'
import type {
  AdminUpdateUserRoleRequestDto,
  AdminUserDto,
  AdminUserRole,
} from '../types/adminUser.types'

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

function normalizeRole(value: string): AdminUserRole {
  return value === 'Admin' ? 'Admin' : 'User'
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

export async function deleteAdminUser(id: number): Promise<void> {
  await userServiceClient.delete(`/api/admin/users/${id}`)
}
