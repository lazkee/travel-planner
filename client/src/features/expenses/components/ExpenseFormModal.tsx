import { useEffect, useState } from 'react'
import type * as React from 'react'
import Button from '../../../components/ui/Button'
import DateInput from '../../../components/ui/DateInput'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Select from '../../../components/ui/Select'
import Textarea from '../../../components/ui/Textarea'
import {
  expenseCategories,
  type ExpenseCategory,
  type ExpenseDto,
  type ExpenseRequestDto,
} from '../types/expense.types'

type ExpenseFormModalProps = {
  initialExpense?: ExpenseDto | null
  isOpen: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  onSubmit: (request: ExpenseRequestDto) => Promise<void>
}

type ExpenseFormData = {
  name: string
  category: ExpenseCategory
  amount: string
  date: string
  description: string
}

const emptyFormData: ExpenseFormData = {
  name: '',
  category: 'Accommodation',
  amount: '',
  date: '',
  description: '',
}

function toDateInputValue(value: string) {
  return value ? value.slice(0, 10) : ''
}

function toOptionalString(value: string) {
  const trimmedValue = value.trim()

  return trimmedValue || undefined
}

function ExpenseFormModal({
  initialExpense,
  isOpen,
  mode,
  onClose,
  onSubmit,
}: ExpenseFormModalProps) {
  const [formData, setFormData] = useState<ExpenseFormData>(emptyFormData)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (initialExpense) {
      setFormData({
        name: initialExpense.name,
        category: initialExpense.category,
        amount: String(initialExpense.amount),
        date: toDateInputValue(initialExpense.date),
        description: initialExpense.description ?? '',
      })
    } else {
      setFormData(emptyFormData)
    }

    setError('')
    setIsSubmitting(false)
  }, [initialExpense, isOpen])

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function validateForm() {
    if (!formData.name.trim()) {
      return 'Expense name is required.'
    }

    if (!formData.category) {
      return 'Category is required.'
    }

    if (!formData.amount) {
      return 'Amount is required.'
    }

    const amount = Number(formData.amount)

    if (Number.isNaN(amount)) {
      return 'Amount must be a valid number.'
    }

    if (amount < 0) {
      return 'Amount cannot be negative.'
    }

    if (!formData.date) {
      return 'Date is required.'
    }

    return ''
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await onSubmit({
        name: formData.name.trim(),
        category: formData.category,
        amount: Number(formData.amount),
        date: formData.date,
        description: toOptionalString(formData.description),
      })
      onClose()
    } catch {
      // Operation errors are shown through toast notifications by the parent.
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add expense' : 'Edit expense'}
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        {error ? <ErrorAlert message={error} /> : null}

        <Input
          autoComplete="off"
          disabled={isSubmitting}
          label="Expense name"
          maxLength={200}
          name="name"
          onChange={handleChange}
          required
          value={formData.name}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            disabled={isSubmitting}
            id="expense-category"
            label="Category"
            name="category"
            onChange={handleChange}
            required
            value={formData.category}
          >
            {expenseCategories
              .filter((category) => category !== 'Activities')
              .map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
          </Select>

          <Input
            disabled={isSubmitting}
            label="Amount"
            min="0"
            name="amount"
            onChange={handleChange}
            required
            step="0.01"
            type="number"
            value={formData.amount}
          />
        </div>

        <DateInput
          disabled={isSubmitting}
          label="Date"
          name="date"
          onChange={handleChange}
          required
          value={formData.date}
        />

        <Textarea
          disabled={isSubmitting}
          label="Description"
          maxLength={1000}
          name="description"
          onChange={handleChange}
          placeholder="Optional notes about this expense"
          value={formData.description}
        />

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button disabled={isSubmitting} onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button isLoading={isSubmitting} type="submit" variant="primary">
            {mode === 'create' ? 'Add expense' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ExpenseFormModal
