export type AdminUserRole = 'User' | 'Admin'

export interface AdminUserDto {
  id: number
  name: string
  email: string
  role: AdminUserRole
  createdAt: string
}

export interface AdminUpdateUserRoleRequestDto {
  role: AdminUserRole
}

export interface AdminUpdateUserRequestDto {
  name: string
  email: string
}
