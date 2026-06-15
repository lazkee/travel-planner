import travelServiceClient from '../../../api/travelServiceClient'
import type {
  CreateShareRequestDto,
  ShareAccessLevel,
  ShareTokenDto,
} from '../types/share.types'

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

function normalizeAccessLevel(value: string): ShareAccessLevel {
  return value === 'Edit' ? 'Edit' : 'View'
}

function normalizeShareToken(data: unknown): ShareTokenDto {
  const source = isRecord(data) ? data : {}

  return {
    token: getString(source, ['token', 'Token']),
    travelPlanId: getNumber(source, ['travelPlanId', 'TravelPlanId']),
    accessLevel: normalizeAccessLevel(
      getString(source, ['accessLevel', 'AccessLevel']),
    ),
    expiresAtUtc: getString(source, ['expiresAtUtc', 'ExpiresAtUtc']),
    shareUrl: getString(source, ['shareUrl', 'ShareUrl']),
    qrCodeDataUrl: getString(source, ['qrCodeDataUrl', 'QrCodeDataUrl']),
  }
}

function unwrapCreatedShareToken(data: unknown): ShareTokenDto {
  const source = isRecord(data) ? data : {}
  const wrappedToken = getRecordValue(source, ['token', 'Token'])
  const isSuccess = getRecordValue(source, ['isSuccess', 'IsSuccess'])

  if (isSuccess !== undefined) {
    if (isRecord(wrappedToken)) {
      return normalizeShareToken(wrappedToken)
    }

    throw new Error(getString(source, ['errorCode', 'ErrorCode']))
  }

  return normalizeShareToken(data)
}

export async function getShares(planId: number): Promise<ShareTokenDto[]> {
  const response = await travelServiceClient.get(
    `/api/travel-plans/${planId}/shares`,
  )
  const shares = Array.isArray(response.data) ? response.data : []

  return shares.map(normalizeShareToken)
}

export async function createShare(
  planId: number,
  request: CreateShareRequestDto,
): Promise<ShareTokenDto> {
  const response = await travelServiceClient.post(
    `/api/travel-plans/${planId}/shares`,
    request,
  )

  return unwrapCreatedShareToken(response.data)
}

export async function deleteShare(
  planId: number,
  token: string,
): Promise<void> {
  await travelServiceClient.delete(
    `/api/travel-plans/${planId}/shares/${encodeURIComponent(token)}`,
  )
}
