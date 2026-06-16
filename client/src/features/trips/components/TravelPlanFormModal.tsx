import { useEffect, useState } from 'react'
import type * as React from 'react'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import DateInput from '../../../components/ui/DateInput'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Textarea from '../../../components/ui/Textarea'
import type {
  TravelPlanDto,
  TravelPlanRequestDto,
} from '../types/travelPlan.types'

type TravelPlanFormModalProps = {
  initialPlan?: TravelPlanDto | null
  isOpen: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  onSubmit: (request: TravelPlanRequestDto) => Promise<void>
}

type TravelPlanFormData = {
  name: string
  description: string
  startDate: string
  endDate: string
  budget: string
  notes: string
}

const emptyFormData: TravelPlanFormData = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  budget: '0',
  notes: '',
}

function toDateInputValue(value: string) {
  return value ? value.slice(0, 10) : ''
}

function getTodayDateInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function toOptionalString(value: string) {
  const trimmedValue = value.trim()

  return trimmedValue || undefined
}

function TravelPlanFormModal({
  initialPlan,
  isOpen,
  mode,
  onClose,
  onSubmit,
}: TravelPlanFormModalProps) {
  const [formData, setFormData] = useState<TravelPlanFormData>(emptyFormData)
  const [error, setError] = useState('')
  const [dateRangeError, setDateRangeError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const today = getTodayDateInputValue()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (initialPlan) {
      setFormData({
        name: initialPlan.name,
        description: initialPlan.description ?? '',
        startDate: toDateInputValue(initialPlan.startDate),
        endDate: toDateInputValue(initialPlan.endDate),
        budget: String(initialPlan.budget),
        notes: initialPlan.notes ?? '',
      })
    } else {
      setFormData(emptyFormData)
    }

    setError('')
    setDateRangeError('')
    setIsSubmitting(false)
  }, [initialPlan, isOpen])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target

    if ((name === 'startDate' || name === 'endDate') && dateRangeError) {
      setDateRangeError('')
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function validateForm() {
    if (!formData.name.trim()) {
      return 'Trip name is required.'
    }

    if (!formData.startDate) {
      return 'Start date is required.'
    }

    if (mode === 'create' && formData.startDate < today) {
      return 'Start date cannot be in the past.'
    }

    if (!formData.endDate) {
      return 'End date is required.'
    }

    if (formData.endDate < formData.startDate) {
      return 'End date cannot be before start date.'
    }

    const budget = formData.budget === '' ? 0 : Number(formData.budget)

    if (Number.isNaN(budget)) {
      return 'Budget must be a valid number.'
    }

    if (budget < 0) {
      return 'Budget cannot be negative.'
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
    setDateRangeError('')
    setIsSubmitting(true)

    const budget = formData.budget === '' ? 0 : Number(formData.budget)

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: toOptionalString(formData.description),
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget,
        notes: toOptionalString(formData.notes),
      })
      onClose()
    } catch (submitError) {
      const message = getApiErrorMessage(submitError)
      if (message.includes('date range must include all existing activities')) {
        setDateRangeError(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create trip' : 'Edit trip'}
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        {error ? <ErrorAlert message={error} /> : null}

        <Input
          autoComplete="off"
          disabled={isSubmitting}
          label="Trip name"
          maxLength={200}
          name="name"
          onChange={handleChange}
          required
          value={formData.name}
        />

        <Textarea
          disabled={isSubmitting}
          label="Description"
          maxLength={1000}
          name="description"
          onChange={handleChange}
          placeholder="Short overview of this trip"
          value={formData.description}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <DateInput
            disabled={isSubmitting}
            label="Start date"
            min={mode === 'create' ? today : undefined}
            name="startDate"
            onChange={handleChange}
            required
            value={formData.startDate}
          />
          <DateInput
            disabled={isSubmitting}
            label="End date"
            min={formData.startDate || today}
            name="endDate"
            onChange={handleChange}
            required
            value={formData.endDate}
          />
        </div>

        {dateRangeError ? <ErrorAlert message={dateRangeError} /> : null}

        <Input
          disabled={isSubmitting}
          label="Budget"
          min="0"
          name="budget"
          onChange={handleChange}
          step="0.01"
          type="number"
          value={formData.budget}
        />

        <Textarea
          disabled={isSubmitting}
          label="Notes"
          maxLength={2000}
          name="notes"
          onChange={handleChange}
          placeholder="Important reminders, links, or ideas"
          value={formData.notes}
        />

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button disabled={isSubmitting} onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button isLoading={isSubmitting} type="submit" variant="primary">
            {mode === 'create' ? 'Create trip' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default TravelPlanFormModal
