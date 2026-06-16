import type { UserRole } from '../../auth/types/auth.types'

export interface UserProfileDto {
  id: number
  name: string
  email: string
  role: UserRole
  createdAt: string
}

export interface UpdateUserProfileRequestDto {
  name: string
  email: string
}
