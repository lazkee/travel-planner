import { useEffect, useState } from 'react'
import type * as React from 'react'
import Button from '../../../components/ui/Button'
import DateInput from '../../../components/ui/DateInput'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Textarea from '../../../components/ui/Textarea'
import type {
  DestinationDto,
  DestinationRequestDto,
} from '../types/destination.types'

type DestinationFormModalProps = {
  initialDestination?: DestinationDto | null
  isOpen: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  onSubmit: (request: DestinationRequestDto) => Promise<void>
}

type DestinationFormData = {
  name: string
  location: string
  arrivalDate: string
  departureDate: string
  description: string
}

const emptyFormData: DestinationFormData = {
  name: '',
  location: '',
  arrivalDate: '',
  departureDate: '',
  description: '',
}

function toDateInputValue(value: string) {
  return value ? value.slice(0, 10) : ''
}

function toOptionalString(value: string) {
  const trimmedValue = value.trim()

  return trimmedValue || undefined
}

function DestinationFormModal({
  initialDestination,
  isOpen,
  mode,
  onClose,
  onSubmit,
}: DestinationFormModalProps) {
  const [formData, setFormData] =
    useState<DestinationFormData>(emptyFormData)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (initialDestination) {
      setFormData({
        name: initialDestination.name,
        location: initialDestination.location,
        arrivalDate: toDateInputValue(initialDestination.arrivalDate),
        departureDate: toDateInputValue(initialDestination.departureDate),
        description: initialDestination.description ?? '',
      })
    } else {
      setFormData(emptyFormData)
    }

    setError('')
    setIsSubmitting(false)
  }, [initialDestination, isOpen])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function validateForm() {
    if (!formData.name.trim()) {
      return 'Destination name is required.'
    }

    if (!formData.location.trim()) {
      return 'Location is required.'
    }

    if (!formData.arrivalDate) {
      return 'Arrival date is required.'
    }

    if (!formData.departureDate) {
      return 'Departure date is required.'
    }

    if (formData.departureDate < formData.arrivalDate) {
      return 'Departure date cannot be before arrival date.'
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
        location: formData.location.trim(),
        arrivalDate: formData.arrivalDate,
        departureDate: formData.departureDate,
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
      title={mode === 'create' ? 'Add destination' : 'Edit destination'}
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        {error ? <ErrorAlert message={error} /> : null}

        <Input
          autoComplete="off"
          disabled={isSubmitting}
          label="Destination name"
          maxLength={200}
          name="name"
          onChange={handleChange}
          required
          value={formData.name}
        />

        <Input
          autoComplete="off"
          disabled={isSubmitting}
          label="Location"
          maxLength={300}
          name="location"
          onChange={handleChange}
          required
          value={formData.location}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <DateInput
            disabled={isSubmitting}
            label="Arrival date"
            name="arrivalDate"
            onChange={handleChange}
            required
            value={formData.arrivalDate}
          />
          <DateInput
            disabled={isSubmitting}
            label="Departure date"
            name="departureDate"
            onChange={handleChange}
            required
            value={formData.departureDate}
          />
        </div>

        <Textarea
          disabled={isSubmitting}
          label="Description"
          maxLength={1000}
          name="description"
          onChange={handleChange}
          placeholder="Optional notes about this destination"
          value={formData.description}
        />

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button disabled={isSubmitting} onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button isLoading={isSubmitting} type="submit" variant="primary">
            {mode === 'create' ? 'Add destination' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default DestinationFormModal
