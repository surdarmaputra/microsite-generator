'use client'
import * as RadixToast from '@radix-ui/react-toast'
import { AlertCircle, CheckCircle, Info, TriangleAlert, X } from 'lucide-react'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { cn } from './cn'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => void 0 })

export function useToast() {
  return useContext(ToastContext)
}

export function toast(message: string, variant: ToastVariant = 'success') {
  window.dispatchEvent(new CustomEvent('toast', { detail: { message, variant } }))
}

const icons: Record<ToastVariant, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: TriangleAlert,
  error: AlertCircle,
}

const tones: Record<ToastVariant, string> = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-danger',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, variant }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    function onEvent(e: Event) {
      const { message, variant } = (e as CustomEvent).detail
      addToast(message, variant)
    }
    window.addEventListener('toast', onEvent)
    return () => window.removeEventListener('toast', onEvent)
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        {toasts.map(t => {
          const Icon = icons[t.variant]
          return (
            <RadixToast.Root
              key={t.id}
              duration={4000}
              onOpenChange={open => { if (!open) removeToast(t.id) }}
              className={cn(
                'rounded-card border-hairline bg-surface-card shadow-raised flex w-80 items-start gap-3 border p-3',
                'data-[state=closed]:animate-[toast-hide_150ms_ease-in_forwards]',
                'data-[state=open]:animate-[toast-show_200ms_ease-out]',
              )}
            >
              <span className={cn('mt-0.5 shrink-0', tones[t.variant])}>
                <Icon size={18} aria-hidden />
              </span>
              <RadixToast.Description className="text-caption min-w-0 flex-1">
                {t.message}
              </RadixToast.Description>
              <RadixToast.Close asChild>
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  aria-label="Dismiss"
                  className="rounded-control text-ink-secondary hover:bg-surface-hover hover:text-ink-primary grid size-6 shrink-0 place-items-center transition-colors"
                >
                  <X size={14} />
                </button>
              </RadixToast.Close>
            </RadixToast.Root>
          )
        })}
        <RadixToast.Viewport className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  )
}
