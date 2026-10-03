import type { ReactNode } from 'react'
import { cn } from '~/components/ui/cn'
import type { PreviewDevice } from './devices'

/** Device chrome around a preview: a phone bezel or a browser window. */
export function DeviceFrame({
  device,
  children,
  className,
}: {
  device: PreviewDevice
  children: ReactNode
  className?: string
}) {
  if (device === 'desktop') {
    return (
      <div
        className={cn(
          'shadow-raised border-hairline flex w-full flex-col overflow-hidden rounded-card border bg-surface-card',
          className,
        )}
      >
        <div aria-hidden="true" className="border-hairline flex h-7 shrink-0 items-center gap-1.5 border-b px-3">
          <span className="size-2.5 rounded-full bg-surface-hover" />
          <span className="size-2.5 rounded-full bg-surface-hover" />
          <span className="size-2.5 rounded-full bg-surface-hover" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col bg-white">{children}</div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'shadow-raised flex w-full max-w-[398px] flex-col rounded-[1.75rem] bg-ink-primary/90 p-1',
        className,
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.5rem] bg-white">{children}</div>
    </div>
  )
}
