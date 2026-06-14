import Button from './Button'
import Modal from './Modal'

type ConfirmDialogProps = {
  cancelLabel?: string
  confirmLabel?: string
  isOpen: boolean
  isSubmitting?: boolean
  message: string
  title: string
  onCancel: () => void
  onConfirm: () => void | Promise<void>
}

function ConfirmDialog({
  cancelLabel = 'Cancel',
  confirmLabel = 'Delete',
  isOpen,
  isSubmitting = false,
  message,
  onCancel,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  return (
    <Modal
      footer={
        <>
          <Button disabled={isSubmitting} onClick={onCancel} variant="secondary">
            {cancelLabel}
          </Button>
          <Button isLoading={isSubmitting} onClick={onConfirm} variant="danger">
            {confirmLabel}
          </Button>
        </>
      }
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
    >
      <p className="m-0 text-slate-600">{message}</p>
    </Modal>
  )
}

export default ConfirmDialog
