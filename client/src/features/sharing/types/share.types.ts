export type ShareAccessLevel = 'View' | 'Edit'

export interface ShareTokenDto {
  token: string
  travelPlanId: number
  accessLevel: ShareAccessLevel
  expiresAtUtc: string
  shareUrl: string
  qrCodeDataUrl: string
}

export interface CreateShareRequestDto {
  accessLevel: ShareAccessLevel
  expiresAtUtc: string
}
