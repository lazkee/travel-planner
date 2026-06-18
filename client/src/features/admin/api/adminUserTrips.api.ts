import travelServiceClient from '../../../api/travelServiceClient'
import { normalizeTravelPlan } from '../../trips/api/travelPlans.api'
import type { TravelPlanDto } from '../../trips/types/travelPlan.types'

export async function getAdminUserTrips(): Promise<TravelPlanDto[]> {
  const response = await travelServiceClient.get('/api/admin/user-trips')
  const plans = Array.isArray(response.data) ? response.data : []

  return plans.map(normalizeTravelPlan)
}
