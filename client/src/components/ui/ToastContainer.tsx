import { useToast, type ToastType } from '../../context/ToastContext'

const toastStyles: Record<
  ToastType,
  {
    card: string
    closeButton: string
    dot: string
    title: string
  }
> = {
  error: {
    card: 'border-red-200 bg-red-50 text-red-900',
    closeButton: 'text-red-700 hover:bg-red-100',
    dot: 'bg-red-500',
    title: 'Error',
  },
  info: {
    card: 'border-blue-200 bg-blue-50 text-blue-900',
    closeButton: 'text-blue-700 hover:bg-blue-100',
    dot: 'bg-blue-500',
    title: 'Info',
  },
  success: {
    card: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    closeButton: 'text-emerald-700 hover:bg-emerald-100',
    dot: 'bg-emerald-500',
    title: 'Success',
  },
}

function ToastContainer() {
  const { removeToast, toasts } = useToast()

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-[100] grid w-[calc(100vw-2rem)] max-w-sm gap-3">
      {toasts.map((toast) => {
        const styles = toastStyles[toast.type]

        return (
          <div
            className={[
              'flex items-start gap-3 rounded-xl border p-4 shadow-lg shadow-slate-900/10',
              styles.card,
            ].join(' ')}
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
          >
            <span
              aria-hidden="true"
              className={['mt-1 h-2.5 w-2.5 rounded-full', styles.dot].join(
                ' ',
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="m-0 text-sm font-extrabold">{styles.title}</p>
              <p className="m-0 mt-1 text-sm leading-5">{toast.message}</p>
            </div>
            <button
              aria-label="Close notification"
              className={[
                '-mt-1 rounded-lg px-2 py-1 text-sm font-extrabold transition',
                styles.closeButton,
              ].join(' ')}
              onClick={() => removeToast(toast.id)}
              type="button"
            >
              x
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default ToastContainer
