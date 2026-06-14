export interface TravelPlanDto {
  id: number
  userId: number
  name: string
  description?: string
  startDate: string
  endDate: string
  budget: number
  notes?: string
  createdAt: string
}

export interface TravelPlanRequestDto {
  name: string
  description?: string
  startDate: string
  endDate: string
  budget: number
  notes?: string
}
