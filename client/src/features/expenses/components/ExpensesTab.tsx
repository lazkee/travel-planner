import { useCallback, useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import {
  deleteActivity,
  getActivities,
  updateActivity,
} from '../../activities/api/activities.api'
import ActivityFormModal from '../../activities/components/ActivityFormModal'
import type {
  ActivityDto,
  ActivityRequestDto,
} from '../../activities/types/activity.types'
import type { BudgetSummaryDto } from '../../trips/types/budgetSummary.types'
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from '../api/expenses.api'
import type {
  ExpenseCategory,
  ExpenseDto,
  ExpenseFilter,
  ExpenseRequestDto,
} from '../types/expense.types'
import { expenseCategories } from '../types/expense.types'
import BudgetCategoryBreakdown from './BudgetCategoryBreakdown'
import ExpenseFormModal from './ExpenseFormModal'
import ExpenseTable from './ExpenseTable'

type ExpensesTabProps = {
  budgetSummary: BudgetSummaryDto | null
  planId: number
  readonly?: boolean
  onExpensesChanged?: () => void | Promise<void>
}

function getEmptyCategoryAmounts(): Record<ExpenseCategory, number> {
  return expenseCategories.reduce<Record<ExpenseCategory, number>>(
    (amounts, category) => ({
      ...amounts,
      [category]: 0,
    }),
    {
      Accommodation: 0,
      Activities: 0,
      Food: 0,
      Other: 0,
      Shopping: 0,
      Tickets: 0,
      Transport: 0,
    },
  )
}

function getActivityCostTotal(activities: ActivityDto[]) {
  return activities
    .filter(
      (activity) =>
        activity.status !== 'Cancelled' && activity.estimatedCost > 0,
    )
    .reduce((total, activity) => total + activity.estimatedCost, 0)
}

function buildCategoryAmounts(
  expenses: ExpenseDto[],
  activities: ActivityDto[],
) {
  const amounts = getEmptyCategoryAmounts()

  expenses.forEach((expense) => {
    amounts[expense.category] += expense.amount
  })

  amounts.Activities += getActivityCostTotal(activities)

  return amounts
}

function getUsedBudget(
  expenses: ExpenseDto[],
  activities: ActivityDto[],
) {
  const recordedExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  )

  return recordedExpenses + getActivityCostTotal(activities)
}


function ExpensesTab({
  budgetSummary,
  onExpensesChanged,
  planId,
  readonly = false,
}: ExpensesTabProps) {
  const [expenses, setExpenses] = useState<ExpenseDto[]>([])
  const [activities, setActivities] = useState<ActivityDto[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<ExpenseFilter>('All')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseDto | null>(null)
  const [deletingExpense, setDeletingExpense] = useState<ExpenseDto | null>(
    null,
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [isActivityFormModalOpen, setIsActivityFormModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ActivityDto | null>(
    null,
  )
  const [deletingActivity, setDeletingActivity] = useState<ActivityDto | null>(
    null,
  )
  const [isDeletingActivity, setIsDeletingActivity] = useState(false)

  const loadBudgetItems = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const [nextExpenses, nextActivities] = await Promise.all([
        getExpenses(planId),
        getActivities(planId),
      ])
      setExpenses(nextExpenses)
      setActivities(nextActivities)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [planId])

  useEffect(() => {
    void loadBudgetItems()
  }, [loadBudgetItems])

  const categoryAmounts = useMemo(
    () => buildCategoryAmounts(expenses, activities),
    [activities, expenses],
  )
  const localUsedBudget = useMemo(
    () => getUsedBudget(expenses, activities),
    [activities, expenses],
  )
  const usedBudget = budgetSummary?.totalExpenses ?? localUsedBudget

  function handleAddClick() {
    setEditingExpense(null)
    setIsFormModalOpen(true)
  }

  function handleEditClick(expense: ExpenseDto) {
    setEditingExpense(expense)
    setIsFormModalOpen(true)
  }

  function handleCloseFormModal() {
    setIsFormModalOpen(false)
    setEditingExpense(null)
  }

  function handleEditActivityClick(activity: ActivityDto) {
    setEditingActivity(activity)
    setIsActivityFormModalOpen(true)
  }

  function handleCloseActivityFormModal() {
    setIsActivityFormModalOpen(false)
    setEditingActivity(null)
  }

  async function handleSaveExpense(request: ExpenseRequestDto) {
    if (editingExpense) {
      await updateExpense(planId, editingExpense.id, request)
    } else {
      await createExpense(planId, request)
    }

    await loadBudgetItems()
    await onExpensesChanged?.()
  }

  async function handleSaveActivity(request: ActivityRequestDto) {
    if (!editingActivity) {
      return
    }

    await updateActivity(planId, editingActivity.id, request)
    await loadBudgetItems()
    await onExpensesChanged?.()
  }

  async function handleConfirmDelete() {
    if (!deletingExpense) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      await deleteExpense(planId, deletingExpense.id)
      setDeletingExpense(null)
      await loadBudgetItems()
      await onExpensesChanged?.()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
      setDeletingExpense(null)
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleConfirmDeleteActivity() {
    if (!deletingActivity) {
      return
    }

    setIsDeletingActivity(true)
    setError('')

    try {
      await deleteActivity(planId, deletingActivity.id)
      setDeletingActivity(null)
      await loadBudgetItems()
      await onExpensesChanged?.()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
      setDeletingActivity(null)
    } finally {
      setIsDeletingActivity(false)
    }
  }

  return (
    <section className="grid gap-5">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="m-0 text-xl font-bold text-slate-900">Expenses</h2>
          <p className="m-0 mt-1 text-sm text-slate-500">
            Track recorded expenses and activity costs against this trip budget.
          </p>
        </div>

        {!readonly ? (
          <Button
            className="w-full sm:w-auto"
            onClick={handleAddClick}
            variant="primary"
          >
            Add expense
          </Button>
        ) : null}
      </header>

      {error ? <ErrorAlert message={error} /> : null}

      {isLoading ? <LoadingSpinner label="Loading expenses..." /> : null}

      {!isLoading && !error && expenses.length === 0 && activities.length === 0 ? (
        <EmptyState
          action={
            !readonly ? (
              <Button onClick={handleAddClick} variant="primary">
                Add expense
              </Button>
            ) : null
          }
          description="Add recorded expenses or activity estimates to see budget usage here."
          title="No budget items yet"
        />
      ) : null}

      {!isLoading && (expenses.length > 0 || activities.length > 0) ? (
        <>
          <BudgetCategoryBreakdown
            categoryAmounts={categoryAmounts}
            onSelect={setSelectedFilter}
            selectedFilter={selectedFilter}
            usedBudget={usedBudget}
          />

          <ExpenseTable
            activities={activities}
            expenses={expenses}
            onDelete={setDeletingExpense}
            onDeleteActivity={setDeletingActivity}
            onEdit={handleEditClick}
            onEditActivity={handleEditActivityClick}
            readonly={readonly}
            selectedFilter={selectedFilter}
          />
        </>
      ) : null}

      {!isLoading && error && expenses.length === 0 && activities.length === 0 ? (
        <div>
          <Button onClick={loadBudgetItems} variant="secondary">
            Try again
          </Button>
        </div>
      ) : null}

      <ExpenseFormModal
        initialExpense={editingExpense}
        isOpen={isFormModalOpen}
        mode={editingExpense ? 'edit' : 'create'}
        onClose={handleCloseFormModal}
        onSubmit={handleSaveExpense}
      />

      <ActivityFormModal
        initialActivity={editingActivity}
        isOpen={isActivityFormModalOpen}
        mode="edit"
        onClose={handleCloseActivityFormModal}
        onSubmit={handleSaveActivity}
      />

      <ConfirmDialog
        confirmLabel="Delete expense"
        isOpen={Boolean(deletingExpense)}
        isSubmitting={isDeleting}
        message={
          deletingExpense
            ? `Delete "${deletingExpense.name}"? This cannot be undone.`
            : 'Delete this expense?'
        }
        onCancel={() => setDeletingExpense(null)}
        onConfirm={handleConfirmDelete}
        title="Delete expense"
      />

      <ConfirmDialog
        confirmLabel="Delete activity"
        isOpen={Boolean(deletingActivity)}
        isSubmitting={isDeletingActivity}
        message={
          deletingActivity
            ? `Delete "${deletingActivity.name}"? This removes the activity and its planned cost.`
            : 'Delete this activity?'
        }
        onCancel={() => setDeletingActivity(null)}
        onConfirm={handleConfirmDeleteActivity}
        title="Delete activity"
      />
    </section>
  )
}

export default ExpensesTab
