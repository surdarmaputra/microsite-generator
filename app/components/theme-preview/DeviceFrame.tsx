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
        'shadow-raised w-full max-w-[390px] p-2 rounded-[2rem] bg-ink-primary/90',
        className,
      )}
    >
      <div className="rounded-[1.5rem] overflow-hidden h-full" style={{ background: 'white' }}>
        {children}
      </div>
    </div>
  )
}
