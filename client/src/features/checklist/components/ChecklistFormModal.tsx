import { useEffect, useState } from 'react'
import type * as React from 'react'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import Modal from '../../../components/ui/Modal'
import Textarea from '../../../components/ui/Textarea'
import type {
  ChecklistItemDto,
  ChecklistItemRequestDto,
} from '../types/checklist.types'

type ChecklistFormModalProps = {
  initialItem?: ChecklistItemDto | null
  isOpen: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  onSubmit: (request: ChecklistItemRequestDto) => Promise<void>
}

type ChecklistFormData = {
  text: string
}

const emptyFormData: ChecklistFormData = {
  text: '',
}

function ChecklistFormModal({
  initialItem,
  isOpen,
  mode,
  onClose,
  onSubmit,
}: ChecklistFormModalProps) {
  const [formData, setFormData] = useState<ChecklistFormData>(emptyFormData)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormData({
      text: initialItem?.text ?? '',
    })
    setError('')
    setIsSubmitting(false)
  }, [initialItem, isOpen])

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function validateForm() {
    if (!formData.text.trim()) {
      return 'Checklist item text is required.'
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
        text: formData.text.trim(),
        isCompleted: initialItem?.isCompleted ?? false,
      })
      onClose()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add checklist item' : 'Edit checklist item'}
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        {error ? <ErrorAlert message={error} /> : null}

        <Textarea
          autoFocus
          disabled={isSubmitting}
          label="Checklist item"
          name="text"
          onChange={handleChange}
          placeholder="Example: Pack passports"
          required
          value={formData.text}
        />

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button disabled={isSubmitting} onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button isLoading={isSubmitting} type="submit">
            {mode === 'create' ? 'Add item' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ChecklistFormModal
