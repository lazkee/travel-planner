export interface DestinationDto {
  id: number
  travelPlanId: number
  name: string
  location: string
  arrivalDate: string
  departureDate: string
  description?: string
}

export interface DestinationRequestDto {
  name: string
  location: string
  arrivalDate: string
  departureDate: string
  description?: string
}
