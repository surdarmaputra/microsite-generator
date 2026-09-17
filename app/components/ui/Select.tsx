'use client'
import * as RadixSelect from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'
import { cn } from './cn'

export const Select = RadixSelect.Root
export const SelectValue = RadixSelect.Value

export function SelectTrigger({ className, children, ...props }: RadixSelect.SelectTriggerProps) {
  return (
    <RadixSelect.Trigger
      className={cn(
        'inline-flex h-9 items-center justify-between gap-2 rounded-control border border-hairline bg-surface-card px-3 text-caption text-ink-primary',
        'transition-colors hover:bg-surface-hover disabled:opacity-60',
        className
      )}
      {...props}
    >
      {children}
      <RadixSelect.Icon asChild>
        <ChevronDown size={14} className="text-ink-secondary shrink-0" />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  )
}

export function SelectContent({ className, children, ...props }: RadixSelect.SelectContentProps) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        className={cn(
          'z-50 min-w-[8rem] rounded-card border border-hairline bg-surface-card p-1 shadow-card',
          className
        )}
        position="popper"
        sideOffset={4}
        {...props}
      >
        <RadixSelect.Viewport>{children}</RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  )
}

export function SelectItem({ className, children, ...props }: RadixSelect.SelectItemProps) {
  return (
    <RadixSelect.Item
      className={cn(
        'relative flex cursor-default select-none items-center rounded-control px-2 py-1.5 text-caption text-ink-primary outline-none',
        'data-[highlighted]:bg-surface-hover data-[state=checked]:font-medium',
        className
      )}
      {...props}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  )
}
