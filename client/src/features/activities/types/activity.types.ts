export type ActivityStatus = 'Planned' | 'Reserved' | 'Completed' | 'Cancelled'

export interface ActivityDto {
  id: number
  travelPlanId: number
  name: string
  date: string
  time?: string
  location?: string
  description?: string
  estimatedCost: number
  status: ActivityStatus
}

export interface ActivityRequestDto {
  name: string
  date: string
  time?: string
  location?: string
  description?: string
  estimatedCost: number
  status: ActivityStatus
}

export const activityStatuses: ActivityStatus[] = [
  'Planned',
  'Reserved',
  'Completed',
  'Cancelled',
]
