'use client'
import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from './cn'

export const Drawer = RadixDialog.Root
export const DrawerTrigger = RadixDialog.Trigger
export const DrawerTitle = RadixDialog.Title

export function DrawerContent({
  className,
  children,
  ...props
}: RadixDialog.DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="bg-midnight-ink/50 fixed inset-0 z-50 data-[state=closed]:animate-[overlay-hide_200ms_ease-in_forwards] data-[state=open]:animate-[overlay-show_200ms_ease-out]" />
      <RadixDialog.Content
        className={cn(
          'fixed bottom-0 inset-x-0 z-50 flex flex-col max-h-[85vh]',
          'rounded-t-2xl border-t border-x border-hairline bg-surface-card shadow-raised',
          'data-[state=closed]:animate-[drawer-hide_200ms_ease-in_forwards] data-[state=open]:animate-[drawer-show_200ms_ease-out]',
          className
        )}
        {...props}
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
}

export function DrawerCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close drawer"
      className="rounded-control text-ink-secondary hover:bg-surface-hover hover:text-ink-primary grid size-8 shrink-0 place-items-center transition-colors"
    >
      <X size={16} />
    </button>
  )
}
