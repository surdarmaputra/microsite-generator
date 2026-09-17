'use client'
import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from './cn'

export const Dialog = RadixDialog.Root
export const DialogTrigger = RadixDialog.Trigger
export const DialogTitle = RadixDialog.Title
export const DialogDescription = RadixDialog.Description

export function DialogContent({
  className,
  children,
  ...props
}: RadixDialog.DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="bg-midnight-ink/50 fixed inset-0 z-50 data-[state=closed]:animate-[overlay-hide_200ms_ease-in_forwards] data-[state=open]:animate-[overlay-show_200ms_ease-out]" />
      <RadixDialog.Content
        className={cn(
          'rounded-card border-hairline fixed inset-x-4 bottom-4 z-50 border bg-surface-card shadow-raised',
          'sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2',
          'data-[state=closed]:animate-[modal-hide_200ms_ease-in_forwards] data-[state=open]:animate-[modal-show_200ms_ease-out]',
          className
        )}
        {...props}
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 p-6 pb-0">
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6', className)} {...props} />
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('border-hairline flex justify-end gap-2 border-t p-4', className)} {...props} />
  )
}

export function DialogCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close dialog"
      className="rounded-control text-ink-secondary hover:bg-surface-hover hover:text-ink-primary grid size-8 shrink-0 place-items-center transition-colors"
    >
      <X size={16} />
    </button>
  )
}
