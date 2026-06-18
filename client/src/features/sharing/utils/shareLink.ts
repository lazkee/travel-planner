import type { ShareTokenDto } from '../types/share.types'

export const frontendBaseUrl = (
  import.meta.env.VITE_FRONTEND_URL || window.location.origin
).replace(/\/+$/, '')

export function buildShareLink(token: string): string {
  return `${frontendBaseUrl}/shared/${encodeURIComponent(token)}`
}

export function getShareLink(share: ShareTokenDto): string {
  return share.shareUrl.trim() || buildShareLink(share.token)
}
