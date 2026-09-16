'use client'
import * as RadixToast from '@radix-ui/react-toast'
import { cn } from './cn'
import { createContext, useContext, useState, useCallback } from 'react'

interface ToastItem {
  id: string
  message: string
  variant: 'success' | 'error'
}

interface ToastContextValue {
  toast: (message: string, variant?: 'success' | 'error') => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => void 0 })

export function useToast() {
  return useContext(ToastContext)
}

export function toast(message: string, variant: 'success' | 'error' = 'success') {
  window.dispatchEvent(new CustomEvent('toast', { detail: { message, variant } }))
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((message: string, variant: 'success' | 'error' = 'success') => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, variant }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        {toasts.map(t => (
          <RadixToast.Root
            key={t.id}
            duration={4000}
            onOpenChange={open => {
              if (!open) removeToast(t.id)
            }}
            className={cn(
              'flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              t.variant === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-green-200 bg-green-50 text-green-800'
            )}
          >
            <RadixToast.Description className="text-sm">{t.message}</RadixToast.Description>
            <RadixToast.Close className="ml-auto text-current opacity-60 hover:opacity-100">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  )
}
