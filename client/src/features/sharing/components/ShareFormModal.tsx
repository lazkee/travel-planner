import { useEffect, useState } from 'react'
import type * as React from 'react'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Select from '../../../components/ui/Select'
import type {
  CreateShareRequestDto,
  ShareAccessLevel,
} from '../types/share.types'

type ShareFormModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (request: CreateShareRequestDto) => Promise<void>
}

type ShareFormData = {
  accessLevel: ShareAccessLevel | ''
  expiresAt: string
}

function toDateTimeInputValue(date: Date) {
  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000

  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16)
}

function getDefaultExpiryValue() {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + 7)

  return toDateTimeInputValue(expiry)
}

function ShareFormModal({
  isOpen,
  onClose,
  onSubmit,
}: ShareFormModalProps) {
  const [formData, setFormData] = useState<ShareFormData>({
    accessLevel: 'View',
    expiresAt: getDefaultExpiryValue(),
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormData({
      accessLevel: 'View',
      expiresAt: getDefaultExpiryValue(),
    })
    setError('')
    setIsSubmitting(false)
  }, [isOpen])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function validateForm() {
    if (!formData.accessLevel) {
      return 'Access level is required.'
    }

    if (!formData.expiresAt) {
      return 'Expiration date is required.'
    }

    const expiresAt = new Date(formData.expiresAt)

    if (Number.isNaN(expiresAt.getTime())) {
      return 'Expiration date must be valid.'
    }

    if (expiresAt <= new Date()) {
      return 'Expiration date must be in the future.'
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
        accessLevel: formData.accessLevel || 'View',
        expiresAtUtc: new Date(formData.expiresAt).toISOString(),
      })
      onClose()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create share link">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        {error ? <ErrorAlert message={error} /> : null}

        <Select
          disabled={isSubmitting}
          id="accessLevel"
          label="Access level"
          name="accessLevel"
          onChange={handleChange}
          required
          value={formData.accessLevel}
        >
          <option value="View">View</option>
          <option value="Edit">Edit</option>
        </Select>

        <Input
          disabled={isSubmitting}
          label="Expires at"
          min={toDateTimeInputValue(new Date())}
          name="expiresAt"
          onChange={handleChange}
          required
          type="datetime-local"
          value={formData.expiresAt}
        />

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button disabled={isSubmitting} onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button isLoading={isSubmitting} type="submit" variant="primary">
            Create share link
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ShareFormModal
