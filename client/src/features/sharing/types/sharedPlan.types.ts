import type { ActivityDto } from '../../activities/types/activity.types'
import type { ChecklistItemDto } from '../../checklist/types/checklist.types'
import type { DestinationDto } from '../../destinations/types/destination.types'
import type { ExpenseDto } from '../../expenses/types/expense.types'
import type { BudgetSummaryDto } from '../../trips/types/budgetSummary.types'
import type { ShareAccessLevel } from './share.types'

export interface SharedTravelPlanDto {
  id: number
  name: string
  description?: string
  startDate: string
  endDate: string
  budget: number
  notes?: string
  createdAt: string
  destinations: DestinationDto[]
  activities: ActivityDto[]
  expenses: ExpenseDto[]
  checklistItems: ChecklistItemDto[]
  budgetSummary: BudgetSummaryDto
  accessLevel: ShareAccessLevel
  expiresAtUtc: string
}
