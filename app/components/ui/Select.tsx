'use client'
import * as RadixSelect from '@radix-ui/react-select'
import { cn } from './cn'

export const Select = RadixSelect.Root
export const SelectValue = RadixSelect.Value

export function SelectTrigger({
  className,
  children,
  ...props
}: RadixSelect.SelectTriggerProps) {
  return (
    <RadixSelect.Trigger
      className={cn(
        'inline-flex h-9 items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 gap-2',
        className
      )}
      {...props}
    >
      {children}
      <RadixSelect.Icon>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  )
}

export function SelectContent({
  className,
  children,
  ...props
}: RadixSelect.SelectContentProps) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        className={cn(
          'z-50 min-w-[8rem] rounded-lg border border-gray-100 bg-white p-1 shadow-md',
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

export function SelectItem({
  className,
  children,
  ...props
}: RadixSelect.SelectItemProps) {
  return (
    <RadixSelect.Item
      className={cn(
        'relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm text-gray-700 outline-none data-[highlighted]:bg-gray-100 data-[state=checked]:font-medium',
        className
      )}
      {...props}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  )
}
