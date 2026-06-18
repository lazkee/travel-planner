export type UnknownRecord = Record<string, unknown>

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

export function getRecordValue(source: UnknownRecord, keys: string[]): unknown {
  return keys.map((key) => source[key]).find((value) => value !== undefined)
}

export function getNumber(source: UnknownRecord, keys: string[]): number {
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

export function getString(source: UnknownRecord, keys: string[]): string {
  const value = getRecordValue(source, keys)
  return typeof value === 'string' ? value : ''
}

export function getOptionalString(
  source: UnknownRecord,
  keys: string[],
): string | undefined {
  const value = getString(source, keys).trim()
  return value || undefined
}

export function getBoolean(source: UnknownRecord, keys: string[]): boolean {
  const value = getRecordValue(source, keys)
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }
  return false
}

export function getEnum<T extends string>(
  value: string,
  allowed: readonly T[],
  fallback: T,
): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback
}
