import userServiceClient from '../../../api/userServiceClient'
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  UserRole,
} from '../types/auth.types'

type UnknownRecord = Record<string, unknown>

class MissingTokenError extends Error {}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function getRecordValue(
  source: UnknownRecord | null,
  keys: string[],
): unknown {
  if (!source) {
    return undefined
  }

  return keys.map((key) => source[key]).find((value) => value !== undefined)
}

function getString(source: UnknownRecord | null, keys: string[]) {
  const value = getRecordValue(source, keys)

  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function getNumber(source: UnknownRecord | null, keys: string[]) {
  const value = getRecordValue(source, keys)

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const parsedValue = Number(value)

    return Number.isFinite(parsedValue) ? parsedValue : undefined
  }

  return undefined
}

function normalizeRole(role: string | undefined): UserRole {
  return role?.toLowerCase() === 'admin' ? 'Admin' : 'User'
}

function getEmailPrefix(email: string) {
  return email.split('@')[0]?.trim() || 'Traveler'
}

function decodeJwtPayload(token: string): UnknownRecord | null {
  const payload = token.split('.')[1]

  if (!payload) {
    return null
  }

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      '=',
    )
    const binaryPayload = window.atob(paddedPayload)
    const bytes = Uint8Array.from(binaryPayload, (char) => char.charCodeAt(0))
    const decodedPayload = new TextDecoder().decode(bytes)
    const parsedPayload = JSON.parse(decodedPayload)

    return isRecord(parsedPayload) ? parsedPayload : null
  } catch {
    return null
  }
}

function normalizeAuthResponse(
  responseData: unknown,
  fallbackUser?: Partial<Pick<AuthUser, 'email' | 'name'>>,
): AuthResponse {
  const response = isRecord(responseData) ? responseData : null
  const token = getString(response, ['token', 'Token'])

  if (!token) {
    throw new MissingTokenError('Authentication response did not include token.')
  }

  const responseUser = getRecordValue(response, ['user', 'User'])
  const userSource = isRecord(responseUser) ? responseUser : response
  const tokenPayload = decodeJwtPayload(token)
  const email =
    getString(userSource, ['email', 'Email']) ??
    getString(tokenPayload, [
      'email',
      'Email',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
    ]) ??
    fallbackUser?.email?.trim() ??
    ''
  const name =
    getString(userSource, ['name', 'Name']) ??
    getString(tokenPayload, [
      'name',
      'Name',
      'unique_name',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
    ]) ??
    fallbackUser?.name?.trim() ??
    getEmailPrefix(email)
  const role = normalizeRole(
    getString(userSource, ['role', 'Role']) ??
      getString(tokenPayload, [
        'role',
        'Role',
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
      ]),
  )
  const id =
    getNumber(userSource, ['id', 'Id', 'userId', 'UserId']) ??
    getNumber(tokenPayload, [
      'sub',
      'nameid',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
    ]) ??
    0

  return {
    token,
    user: {
      id,
      name,
      email,
      role,
    },
  }
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await userServiceClient.post('/api/auth/login', request)

  return normalizeAuthResponse(response.data, {
    email: request.email,
  })
}

export async function register(
  request: RegisterRequest,
): Promise<AuthResponse> {
  const response = await userServiceClient.post('/api/auth/register', request)

  try {
    return normalizeAuthResponse(response.data, {
      email: request.email,
      name: request.name,
    })
  } catch (error) {
    if (error instanceof MissingTokenError) {
      return login({
        email: request.email,
        password: request.password,
      })
    }

    throw error
  }
}
