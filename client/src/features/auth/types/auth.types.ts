export type UserRole = 'User' | 'Admin'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export const AUTH_TOKEN_STORAGE_KEY = 'travelPlanner.authToken'
export const AUTH_USER_STORAGE_KEY = 'travelPlanner.authUser'
