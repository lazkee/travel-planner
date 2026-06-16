import { useState } from 'react'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import { useToast } from '../../../context/ToastContext'
import ActivityFormModal from '../../activities/components/ActivityFormModal'
import type {
  ActivityDto,
  ActivityRequestDto,
} from '../../activities/types/activity.types'
import ExpenseFormModal from '../../expenses/components/ExpenseFormModal'
import ExpenseTable from '../../expenses/components/ExpenseTable'
import type {
  ExpenseDto,
  ExpenseRequestDto,
} from '../../expenses/types/expense.types'
import {
  createSharedExpense,
  deleteSharedActivity,
  deleteSharedExpense,
  updateSharedActivity,
  updateSharedExpense,
} from '../api/sharedEdit.api'

type SharedExpensesTabProps = {
  activities: ActivityDto[]
  expenses: ExpenseDto[]
  planEndDate?: string
  planStartDate?: string
  readonly: boolean
  token: string
  onChanged: () => Promise<void>
}

function SharedExpensesTab({
  activities,
  expenses,
  onChanged,
  planEndDate,
  planStartDate,
  readonly,
  token,
}: SharedExpensesTabProps) {
  const { showError, showSuccess } = useToast()
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseDto | null>(null)
  const [deletingExpense, setDeletingExpense] = useState<ExpenseDto | null>(
    null,
  )
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ActivityDto | null>(
    null,
  )
  const [deletingActivity, setDeletingActivity] = useState<ActivityDto | null>(
    null,
  )
  const [isDeleting, setIsDeleting] = useState(false)

  function handleAddClick() {
    setEditingExpense(null)
    setIsExpenseModalOpen(true)
  }

  function handleEditExpense(expense: ExpenseDto) {
    setEditingExpense(expense)
    setIsExpenseModalOpen(true)
  }

  function handleCloseExpenseModal() {
    setIsExpenseModalOpen(false)
    setEditingExpense(null)
  }

  function handleEditActivity(activity: ActivityDto) {
    setEditingActivity(activity)
    setIsActivityModalOpen(true)
  }

  function handleCloseActivityModal() {
    setIsActivityModalOpen(false)
    setEditingActivity(null)
  }

  async function handleSaveExpense(request: ExpenseRequestDto) {
    try {
      if (editingExpense) {
        await updateSharedExpense(token, editingExpense.id, request)
      } else {
        await createSharedExpense(token, request)
      }

      await onChanged()
      showSuccess(editingExpense ? 'Expense updated.' : 'Expense added.')
    } catch (requestError) {
      showError(getApiErrorMessage(requestError))
      throw requestError
    }
  }

  async function handleSaveActivity(request: ActivityRequestDto) {
    if (!editingActivity) {
      return
    }

    try {
      await updateSharedActivity(token, editingActivity.id, request)
      await onChanged()
      showSuccess('Activity updated.')
    } catch (requestError) {
      showError(getApiErrorMessage(requestError))
      throw requestError
    }
  }

  async function handleConfirmDeleteExpense() {
    if (!deletingExpense) {
      return
    }

    setIsDeleting(true)

    try {
      await deleteSharedExpense(token, deletingExpense.id)
      setDeletingExpense(null)
      await onChanged()
      showSuccess('Expense deleted.')
    } catch (requestError) {
      showError(getApiErrorMessage(requestError))
      setDeletingExpense(null)
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleConfirmDeleteActivity() {
    if (!deletingActivity) {
      return
    }

    setIsDeleting(true)

    try {
      await deleteSharedActivity(token, deletingActivity.id)
      setDeletingActivity(null)
      await onChanged()
      showSuccess('Activity deleted.')
    } catch (requestError) {
      showError(getApiErrorMessage(requestError))
      setDeletingActivity(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="grid gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="m-0 text-xl font-bold text-slate-900">Expenses</h2>
          <p className="m-0 mt-1 text-sm text-slate-500">
            Recorded expenses and activity estimated costs for this shared trip.
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

      {expenses.length === 0 && activities.length === 0 ? (
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
      ) : (
        <ExpenseTable
          activities={activities}
          expenses={expenses}
          onDelete={setDeletingExpense}
          onDeleteActivity={setDeletingActivity}
          onEdit={handleEditExpense}
          onEditActivity={handleEditActivity}
          readonly={readonly}
          selectedFilter="All"
        />
      )}

      <ExpenseFormModal
        initialExpense={editingExpense}
        isOpen={isExpenseModalOpen}
        mode={editingExpense ? 'edit' : 'create'}
        onClose={handleCloseExpenseModal}
        onSubmit={handleSaveExpense}
      />

      <ActivityFormModal
        initialActivity={editingActivity}
        isOpen={isActivityModalOpen}
        mode="edit"
        onClose={handleCloseActivityModal}
        onSubmit={handleSaveActivity}
        planEndDate={planEndDate}
        planStartDate={planStartDate}
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
        onConfirm={handleConfirmDeleteExpense}
        title="Delete expense"
      />

      <ConfirmDialog
        confirmLabel="Delete activity"
        isOpen={Boolean(deletingActivity)}
        isSubmitting={isDeleting}
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

export default SharedExpensesTab
