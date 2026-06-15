import travelServiceClient from '../../../api/travelServiceClient'
import type {
  TravelPlanDto,
  TravelPlanRequestDto,
} from '../types/travelPlan.types'

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

function getOptionalString(source: UnknownRecord, keys: string[]) {
  const value = getString(source, keys).trim()

  return value || undefined
}

function normalizeTravelPlan(data: unknown): TravelPlanDto {
  const source = isRecord(data) ? data : {}

  return {
    id: getNumber(source, ['id', 'Id']),
    userId: getNumber(source, ['userId', 'UserId']),
    name: getString(source, ['name', 'Name']),
    description: getOptionalString(source, ['description', 'Description']),
    startDate: getString(source, ['startDate', 'StartDate']),
    endDate: getString(source, ['endDate', 'EndDate']),
    budget: getNumber(source, ['budget', 'Budget']),
    notes: getOptionalString(source, ['notes', 'Notes']),
    createdAt: getString(source, ['createdAt', 'CreatedAt']),
  }
}

function getSafePdfFileName(planName: string) {
  const safePlanName = planName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${safePlanName || 'travel-plan'}-travel-plan.pdf`
}

export async function getTravelPlans(): Promise<TravelPlanDto[]> {
  const response = await travelServiceClient.get('/api/travel-plans')
  const plans = Array.isArray(response.data) ? response.data : []

  return plans.map(normalizeTravelPlan)
}

export async function getTravelPlanById(id: number): Promise<TravelPlanDto> {
  const response = await travelServiceClient.get(`/api/travel-plans/${id}`)

  return normalizeTravelPlan(response.data)
}

export async function createTravelPlan(
  request: TravelPlanRequestDto,
): Promise<TravelPlanDto> {
  const response = await travelServiceClient.post('/api/travel-plans', request)

  return normalizeTravelPlan(response.data)
}

export async function updateTravelPlan(
  id: number,
  request: TravelPlanRequestDto,
): Promise<TravelPlanDto> {
  const response = await travelServiceClient.put(
    `/api/travel-plans/${id}`,
    request,
  )

  return normalizeTravelPlan(response.data)
}

export async function deleteTravelPlan(id: number): Promise<void> {
  await travelServiceClient.delete(`/api/travel-plans/${id}`)
}

export async function downloadTravelPlanPdf(
  id: number,
  planName: string,
): Promise<void> {
  const response = await travelServiceClient.get(`/api/travel-plans/${id}/pdf`, {
    responseType: 'blob',
  })
  const pdfBlob = new Blob([response.data], { type: 'application/pdf' })
  const objectUrl = window.URL.createObjectURL(pdfBlob)
  const link = document.createElement('a')

  link.href = objectUrl
  link.download = getSafePdfFileName(planName)
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(objectUrl)
}
