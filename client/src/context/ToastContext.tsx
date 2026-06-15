import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  removeToast: (id: string) => void
  showError: (message: string) => void
  showInfo: (message: string) => void
  showSuccess: (message: string) => void
  toasts: ToastMessage[]
}

const TOAST_DURATION_MS = 4000

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

function createToastId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const timeoutIds = useRef<Map<string, ReturnType<typeof window.setTimeout>>>(
    new Map(),
  )

  const removeToast = useCallback((id: string) => {
    setToasts((previousToasts) =>
      previousToasts.filter((toast) => toast.id !== id),
    )

    const timeoutId = timeoutIds.current.get(id)

    if (timeoutId) {
      window.clearTimeout(timeoutId)
      timeoutIds.current.delete(id)
    }
  }, [])

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = createToastId()

      setToasts((previousToasts) => [
        ...previousToasts,
        {
          id,
          message,
          type,
        },
      ])

      const timeoutId = window.setTimeout(() => {
        removeToast(id)
      }, TOAST_DURATION_MS)

      timeoutIds.current.set(id, timeoutId)
    },
    [removeToast],
  )

  const showError = useCallback(
    (message: string) => addToast('error', message),
    [addToast],
  )
  const showInfo = useCallback(
    (message: string) => addToast('info', message),
    [addToast],
  )
  const showSuccess = useCallback(
    (message: string) => addToast('success', message),
    [addToast],
  )

  useEffect(() => {
    return () => {
      timeoutIds.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })
      timeoutIds.current.clear()
    }
  }, [])

  const value = useMemo(
    () => ({
      removeToast,
      showError,
      showInfo,
      showSuccess,
      toasts,
    }),
    [removeToast, showError, showInfo, showSuccess, toasts],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider.')
  }

  return context
}
