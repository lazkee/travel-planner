import { useEffect, useReducer } from 'react'
import type * as React from 'react'
import Button from '../../../components/ui/Button'
import DateInput from '../../../components/ui/DateInput'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Textarea from '../../../components/ui/Textarea'
import {
  activityStatuses,
  type ActivityDto,
  type ActivityRequestDto,
  type ActivityStatus,
} from '../types/activity.types'

type ActivityFormModalProps = {
  initialActivity?: ActivityDto | null
  isOpen: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  onSubmit: (request: ActivityRequestDto) => Promise<void>
}

type ActivityFormData = {
  name: string
  date: string
  time: string
  location: string
  description: string
  estimatedCost: string
  status: ActivityStatus
}

const textActivityFormFields = [
  'name',
  'date',
  'time',
  'location',
  'description',
  'estimatedCost',
] as const

type TextActivityFormField = (typeof textActivityFormFields)[number]

type ActivityFormState = {
  formData: ActivityFormData
  error: string
  isSubmitting: boolean
}

type ActivityFormAction =
  | { type: 'resetForCreate' }
  | { type: 'resetForEdit'; payload: ActivityDto }
  | { type: 'fieldChanged'; field: TextActivityFormField; value: string }
  | { type: 'statusChanged'; value: ActivityStatus }
  | { type: 'setError'; message: string }
  | { type: 'submitStarted' }
  | { type: 'submitFinished' }

const emptyFormData: ActivityFormData = {
  name: '',
  date: '',
  time: '',
  location: '',
  description: '',
  estimatedCost: '0',
  status: 'Planned',
}

const initialFormState: ActivityFormState = {
  formData: emptyFormData,
  error: '',
  isSubmitting: false,
}

const selectClassName =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-[11px] text-slate-900 outline-none focus:border-blue-600 focus:ring-[3px] focus:ring-blue-600/15 disabled:bg-slate-50'

function toDateInputValue(value: string) {
  return value ? value.slice(0, 10) : ''
}

function toOptionalString(value: string) {
  const trimmedValue = value.trim()

  return trimmedValue || undefined
}

function toRequestTime(value: string) {
  return value ? `${value}:00` : undefined
}

function isTextActivityFormField(value: string): value is TextActivityFormField {
  return (textActivityFormFields as readonly string[]).includes(value)
}

function isActivityStatus(value: string): value is ActivityStatus {
  return (activityStatuses as readonly string[]).includes(value)
}

function toEditFormData(activity: ActivityDto): ActivityFormData {
  return {
    name: activity.name,
    date: toDateInputValue(activity.date),
    time: activity.time ?? '',
    location: activity.location ?? '',
    description: activity.description ?? '',
    estimatedCost: String(activity.estimatedCost),
    status: activity.status,
  }
}

function activityFormReducer(
  state: ActivityFormState,
  action: ActivityFormAction,
): ActivityFormState {
  switch (action.type) {
    case 'resetForCreate':
      return {
        formData: emptyFormData,
        error: '',
        isSubmitting: false,
      }

    case 'resetForEdit':
      return {
        formData: toEditFormData(action.payload),
        error: '',
        isSubmitting: false,
      }

    case 'fieldChanged':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value,
        },
      }

    case 'statusChanged':
      return {
        ...state,
        formData: {
          ...state.formData,
          status: action.value,
        },
      }

    case 'setError':
      return {
        ...state,
        error: action.message,
      }

    case 'submitStarted':
      return {
        ...state,
        error: '',
        isSubmitting: true,
      }

    case 'submitFinished':
      return {
        ...state,
        isSubmitting: false,
      }

    default:
      return state
  }
}

function ActivityFormModal({
  initialActivity,
  isOpen,
  mode,
  onClose,
  onSubmit,
}: ActivityFormModalProps) {
  const [state, dispatch] = useReducer(activityFormReducer, initialFormState)
  const { error, formData, isSubmitting } = state

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (mode === 'edit' && initialActivity) {
      dispatch({ type: 'resetForEdit', payload: initialActivity })
    } else {
      dispatch({ type: 'resetForCreate' })
    }
  }, [initialActivity, isOpen, mode])

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target

    if (name === 'status') {
      if (isActivityStatus(value)) {
        dispatch({ type: 'statusChanged', value })
      }

      return
    }

    if (isTextActivityFormField(name)) {
      dispatch({
        type: 'fieldChanged',
        field: name,
        value,
      })
    }
  }

  function validateForm() {
    if (!formData.name.trim()) {
      return 'Activity name is required.'
    }

    if (!formData.date) {
      return 'Date is required.'
    }

    if (!formData.status) {
      return 'Status is required.'
    }

    const estimatedCost =
      formData.estimatedCost === '' ? 0 : Number(formData.estimatedCost)

    if (Number.isNaN(estimatedCost)) {
      return 'Estimated cost must be a valid number.'
    }

    if (estimatedCost < 0) {
      return 'Estimated cost cannot be negative.'
    }

    return ''
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationError = validateForm()

    if (validationError) {
      dispatch({ type: 'setError', message: validationError })
      return
    }

    dispatch({ type: 'submitStarted' })

    const estimatedCost =
      formData.estimatedCost === '' ? 0 : Number(formData.estimatedCost)

    try {
      await onSubmit({
        name: formData.name.trim(),
        date: formData.date,
        time: toRequestTime(formData.time),
        location: toOptionalString(formData.location),
        description: toOptionalString(formData.description),
        estimatedCost,
        status: formData.status,
      })
      onClose()
    } catch {
      // Operation errors are shown through toast notifications by the parent.
    } finally {
      dispatch({ type: 'submitFinished' })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add activity' : 'Edit activity'}
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        {error ? <ErrorAlert message={error} /> : null}

        <Input
          autoComplete="off"
          disabled={isSubmitting}
          label="Activity name"
          name="name"
          onChange={handleChange}
          required
          value={formData.name}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <DateInput
            disabled={isSubmitting}
            label="Date"
            name="date"
            onChange={handleChange}
            required
            value={formData.date}
          />
          <Input
            disabled={isSubmitting}
            label="Time"
            name="time"
            onChange={handleChange}
            type="time"
            value={formData.time}
          />
        </div>

        <Input
          autoComplete="off"
          disabled={isSubmitting}
          label="Location"
          name="location"
          onChange={handleChange}
          value={formData.location}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            disabled={isSubmitting}
            label="Estimated cost"
            min="0"
            name="estimatedCost"
            onChange={handleChange}
            step="0.01"
            type="number"
            value={formData.estimatedCost}
          />
          <div className="grid gap-2">
            <label
              className="text-[0.92rem] font-bold text-slate-900"
              htmlFor="activity-status"
            >
              Status
            </label>
            <select
              className={selectClassName}
              disabled={isSubmitting}
              id="activity-status"
              name="status"
              onChange={handleChange}
              required
              value={formData.status}
            >
              {activityStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Textarea
          disabled={isSubmitting}
          label="Description"
          name="description"
          onChange={handleChange}
          placeholder="Optional notes about this activity"
          value={formData.description}
        />

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button isLoading={isSubmitting} type="submit" variant="primary">
            {mode === 'create' ? 'Add activity' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ActivityFormModal
