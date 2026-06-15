export interface ChecklistItemDto {
  id: number
  travelPlanId: number
  text: string
  isCompleted: boolean
}

export interface ChecklistItemRequestDto {
  text: string
  isCompleted: boolean
}
