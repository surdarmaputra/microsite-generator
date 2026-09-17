'use client'
import * as RadixDropdown from '@radix-ui/react-dropdown-menu'
import { cn } from './cn'

export const DropdownMenu = RadixDropdown.Root
export const DropdownMenuTrigger = RadixDropdown.Trigger

export function DropdownMenuContent({
  className,
  children,
  ...props
}: RadixDropdown.DropdownMenuContentProps) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        className={cn(
          'rounded-card border-hairline bg-surface-card shadow-raised z-50 min-w-[160px] overflow-hidden border p-1',
          className
        )}
        sideOffset={4}
        {...props}
      >
        {children}
      </RadixDropdown.Content>
    </RadixDropdown.Portal>
  )
}

export function DropdownMenuItem({
  className,
  ...props
}: RadixDropdown.DropdownMenuItemProps) {
  return (
    <RadixDropdown.Item
      className={cn(
        'rounded-control flex cursor-pointer items-center gap-2 px-3 py-2 text-caption text-ink-primary outline-none transition-colors',
        'data-[highlighted]:bg-surface-hover',
        className
      )}
      {...props}
    />
  )
}

export function DropdownMenuSeparator({
  className,
  ...props
}: RadixDropdown.DropdownMenuSeparatorProps) {
  return (
    <RadixDropdown.Separator
      className={cn('border-hairline -mx-1 my-1 border-t', className)}
      {...props}
    />
  )
}
