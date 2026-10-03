import type { ReactNode } from 'react'
import { cn } from '~/components/ui/cn'

export function DeviceFrame({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'shadow-raised w-full max-w-[390px] p-1 rounded-[1.75rem] bg-ink-primary/90',
        className,
      )}
    >
      <div className="h-full overflow-y-auto rounded-[1.5rem] bg-white">
        {children}
      </div>
    </div>
  )
}
