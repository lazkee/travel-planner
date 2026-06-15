import { useCallback, useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import {
  createChecklistItem,
  deleteChecklistItem,
  getChecklistItems,
  updateChecklistItem,
} from '../api/checklist.api'
import type {
  ChecklistItemDto,
  ChecklistItemRequestDto,
} from '../types/checklist.types'
import ChecklistFormModal from './ChecklistFormModal'
import ChecklistItemList from './ChecklistItemList'

type ChecklistTabProps = {
  planId: number
  readonly?: boolean
}

function ChecklistTab({ planId, readonly = false }: ChecklistTabProps) {
  const [items, setItems] = useState<ChecklistItemDto[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ChecklistItemDto | null>(null)
  const [deletingItem, setDeletingItem] = useState<ChecklistItemDto | null>(
    null,
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingItemId, setTogglingItemId] = useState<number | null>(null)

  const loadChecklistItems = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const nextItems = await getChecklistItems(planId)
      setItems(nextItems)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [planId])

  useEffect(() => {
    void loadChecklistItems()
  }, [loadChecklistItems])

  const completedCount = useMemo(
    () => items.filter((item) => item.isCompleted).length,
    [items],
  )

  function handleAddClick() {
    setEditingItem(null)
    setIsFormModalOpen(true)
  }

  function handleEditClick(item: ChecklistItemDto) {
    setEditingItem(item)
    setIsFormModalOpen(true)
  }

  function handleCloseFormModal() {
    setIsFormModalOpen(false)
    setEditingItem(null)
  }

  async function handleSaveItem(request: ChecklistItemRequestDto) {
    if (editingItem) {
      await updateChecklistItem(planId, editingItem.id, request)
    } else {
      await createChecklistItem(planId, request)
    }

    await loadChecklistItems()
  }

  async function handleToggleItem(item: ChecklistItemDto) {
    const nextIsCompleted = !item.isCompleted

    setTogglingItemId(item.id)
    setError('')
    setItems((previousItems) =>
      previousItems.map((currentItem) =>
        currentItem.id === item.id
          ? {
              ...currentItem,
              isCompleted: nextIsCompleted,
            }
          : currentItem,
      ),
    )

    try {
      const updatedItem = await updateChecklistItem(planId, item.id, {
        text: item.text,
        isCompleted: nextIsCompleted,
      })
      setItems((previousItems) =>
        previousItems.map((currentItem) =>
          currentItem.id === updatedItem.id ? updatedItem : currentItem,
        ),
      )
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
      setItems((previousItems) =>
        previousItems.map((currentItem) =>
          currentItem.id === item.id ? item : currentItem,
        ),
      )
    } finally {
      setTogglingItemId(null)
    }
  }

  async function handleConfirmDelete() {
    if (!deletingItem) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      await deleteChecklistItem(planId, deletingItem.id)
      setDeletingItem(null)
      await loadChecklistItems()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
      setDeletingItem(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="grid gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="m-0 text-xl font-bold text-slate-900">Checklist</h2>
          <p className="m-0 mt-1 text-sm text-slate-500">
            Track simple to-do items for this trip.
          </p>
          {items.length > 0 ? (
            <p className="m-0 mt-2 text-sm font-semibold text-slate-600">
              {completedCount} of {items.length} completed
            </p>
          ) : null}
        </div>

        {!readonly ? (
          <Button className="w-full sm:w-auto" onClick={handleAddClick}>
            Add item
          </Button>
        ) : null}
      </header>

      {error ? <ErrorAlert message={error} /> : null}

      {isLoading ? <LoadingSpinner label="Loading checklist..." /> : null}

      {!isLoading && !error && items.length === 0 ? (
        <EmptyState
          action={!readonly ? <Button onClick={handleAddClick}>Add item</Button> : null}
          description="Add packing tasks, reminders, or other simple trip to-dos."
          title="No checklist items yet"
        />
      ) : null}

      {!isLoading && items.length > 0 ? (
        <ChecklistItemList
          items={items}
          onDelete={setDeletingItem}
          onEdit={handleEditClick}
          onToggle={handleToggleItem}
          readonly={readonly}
          togglingItemId={togglingItemId}
        />
      ) : null}

      {!isLoading && error && items.length === 0 ? (
        <div>
          <Button onClick={loadChecklistItems} variant="secondary">
            Try again
          </Button>
        </div>
      ) : null}

      <ChecklistFormModal
        initialItem={editingItem}
        isOpen={isFormModalOpen}
        mode={editingItem ? 'edit' : 'create'}
        onClose={handleCloseFormModal}
        onSubmit={handleSaveItem}
      />

      <ConfirmDialog
        confirmLabel="Delete item"
        isOpen={Boolean(deletingItem)}
        isSubmitting={isDeleting}
        message={
          deletingItem
            ? `Delete "${deletingItem.text}"? This cannot be undone.`
            : 'Delete this checklist item?'
        }
        onCancel={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        title="Delete checklist item"
      />
    </section>
  )
}

export default ChecklistTab
