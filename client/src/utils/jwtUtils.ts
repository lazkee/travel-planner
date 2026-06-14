type JwtPayload = {
  exp?: unknown
}

function decodeJwtPayload(token: string): JwtPayload | null {
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
    const decodedPayload = window.atob(paddedPayload)
    const parsedPayload = JSON.parse(decodedPayload)

    return typeof parsedPayload === 'object' && parsedPayload !== null
      ? parsedPayload
      : null
  } catch {
    return null
  }
}

export function getJwtExpirationTime(token: string): number | null {
  const payload = decodeJwtPayload(token)
  const expiration = payload?.exp

  if (typeof expiration !== 'number' || !Number.isFinite(expiration)) {
    return null
  }

  return expiration * 1000
}

export function isJwtExpired(token: string): boolean {
  const expirationTime = getJwtExpirationTime(token)

  return !expirationTime || expirationTime <= Date.now()
}
