import type { ReactNode } from 'react'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Tabs, { type TabItem } from '../../../components/ui/Tabs'
import type { BudgetSummaryDto } from '../types/budgetSummary.types'
import type { TravelPlanDto } from '../types/travelPlan.types'
import TripHeader from './TripHeader'

type TripDetailsViewProps = {
  activeTab: string
  backButtonLabel?: string
  budgetSummary: BudgetSummaryDto | null
  children: ReactNode
  headerAside?: ReactNode
  headerBadge?: ReactNode
  headerNotice?: ReactNode
  isBudgetSummaryLoading?: boolean
  onBack?: () => void
  onTabChange: (tabId: string) => void
  plan: TravelPlanDto
  showBackButton?: boolean
  tabs: TabItem[]
}

function TripDetailsView({
  activeTab,
  backButtonLabel = 'Back to trips',
  budgetSummary,
  children,
  headerAside,
  headerBadge,
  headerNotice,
  isBudgetSummaryLoading = false,
  onBack,
  onTabChange,
  plan,
  showBackButton = false,
  tabs,
}: TripDetailsViewProps) {
  return (
    <section className="grid gap-6">
      {showBackButton && onBack ? (
        <div>
          <Button onClick={onBack} variant="secondary">
            {backButtonLabel}
          </Button>
        </div>
      ) : null}

      <TripHeader
        aside={headerAside}
        badge={headerBadge}
        budgetSummary={budgetSummary}
        isBudgetSummaryLoading={isBudgetSummaryLoading}
        notice={headerNotice}
        plan={plan}
      />

      <Card className="overflow-hidden">
        <Tabs activeTab={activeTab} onChange={onTabChange} tabs={tabs} />
        <div className="p-5">{children}</div>
      </Card>
    </section>
  )
}

export default TripDetailsView
