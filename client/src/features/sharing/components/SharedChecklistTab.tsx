import { useState } from 'react'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import ChecklistFormModal from '../../checklist/components/ChecklistFormModal'
import ChecklistItemList from '../../checklist/components/ChecklistItemList'
import type {
  ChecklistItemDto,
  ChecklistItemRequestDto,
} from '../../checklist/types/checklist.types'
import {
  createSharedChecklistItem,
  deleteSharedChecklistItem,
  updateSharedChecklistItem,
} from '../api/sharedEdit.api'

type SharedChecklistTabProps = {
  items: ChecklistItemDto[]
  readonly: boolean
  token: string
  onChanged: () => Promise<void>
}

function SharedChecklistTab({
  items,
  onChanged,
  readonly,
  token,
}: SharedChecklistTabProps) {
  const [error, setError] = useState('')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ChecklistItemDto | null>(null)
  const [deletingItem, setDeletingItem] = useState<ChecklistItemDto | null>(
    null,
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingItemId, setTogglingItemId] = useState<number | null>(null)

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
      await updateSharedChecklistItem(token, editingItem.id, request)
    } else {
      await createSharedChecklistItem(token, request)
    }

    await onChanged()
  }

  async function handleToggleItem(item: ChecklistItemDto) {
    setTogglingItemId(item.id)
    setError('')

    try {
      await updateSharedChecklistItem(token, item.id, {
        text: item.text,
        isCompleted: !item.isCompleted,
      })
      await onChanged()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
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
      await deleteSharedChecklistItem(token, deletingItem.id)
      setDeletingItem(null)
      await onChanged()
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
            Shared trip reminders and to-do items.
          </p>
        </div>
        {!readonly ? (
          <Button
            className="w-full sm:w-auto"
            onClick={handleAddClick}
            variant="primary"
          >
            Add item
          </Button>
        ) : null}
      </header>

      {error ? <ErrorAlert message={error} /> : null}

      {items.length === 0 ? (
        <EmptyState
          action={
            !readonly ? (
              <Button onClick={handleAddClick} variant="primary">
                Add item
              </Button>
            ) : null
          }
          description="Add packing tasks, reminders, or other simple trip to-dos."
          title="No checklist items yet"
        />
      ) : (
        <ChecklistItemList
          items={items}
          onDelete={setDeletingItem}
          onEdit={handleEditClick}
          onToggle={handleToggleItem}
          readonly={readonly}
          togglingItemId={togglingItemId}
        />
      )}

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

export default SharedChecklistTab
