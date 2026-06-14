import type { ReactNode } from 'react'

type ModalProps = {
  children: ReactNode
  footer?: ReactNode
  isOpen: boolean
  title: string
  onClose: () => void
}

function Modal({ children, footer, isOpen, onClose, title }: ModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-modal="true"
        className="max-h-[calc(100vh-48px)] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="m-0 text-xl font-bold text-slate-900">{title}</h2>
          <button
            aria-label="Close"
            className="rounded-lg px-2 py-1 text-2xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </header>
        <div className="max-h-[calc(100vh-180px)] overflow-y-auto px-6 py-5">
          {children}
        </div>
        {footer ? (
          <footer className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  )
}

export default Modal
