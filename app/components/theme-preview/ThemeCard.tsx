'use client'
import { useState, type ReactNode } from 'react'
import { Maximize2 } from 'lucide-react'
import { ThemePreview } from './ThemePreview'
import { ThemePreviewDialog } from './ThemePreviewDialog'
import { resolveTheme } from '~/lib/doc'
import type { ThemeManifest } from '~/components/themes'
import { Badge } from '~/components/ui/Badge'
import { cn } from '~/components/ui/cn'

interface ThemeCardProps {
  theme: ThemeManifest
  footer?: ReactNode
  size?: 'md' | 'sm'
  selected?: boolean
  onSelect?: () => void
}

export function ThemeCard({ theme, footer, size = 'md', selected, onSelect }: ThemeCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const themeId = resolveTheme(theme.id)
  const heightClass = size === 'sm' ? 'h-40' : 'h-72'

  const gradient = (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-card to-transparent" />
  )

  const expandButton = (
    <button
      type="button"
      aria-label={`Expand ${theme.label} preview`}
      onClick={() => setDialogOpen(true)}
      className="absolute top-2 right-2 rounded-control bg-surface-card/80 text-ink-secondary hover:bg-surface-card hover:text-ink-primary grid size-8 place-items-center transition-colors"
    >
      <Maximize2 size={14} />
    </button>
  )

  return (
    <>
      <article
        aria-label={theme.label}
        className={cn(
          'rounded-card border-hairline bg-surface-card shadow-card border overflow-hidden',
          selected && 'ring-2 ring-accent',
        )}
      >
        {/* Preview window */}
        {onSelect ? (
          /* When selectable: select button and expand button are siblings inside a relative wrapper */
          <div className={cn('relative', heightClass)}>
            <button
              type="button"
              aria-label={`Use ${theme.label} theme`}
              aria-pressed={selected}
              onClick={onSelect}
              className="absolute inset-0 w-full overflow-hidden"
            >
              <ThemePreview theme={themeId} />
              {gradient}
            </button>
            {expandButton}
          </div>
        ) : (
          <div className={cn('relative', heightClass, 'overflow-hidden')}>
            <ThemePreview theme={themeId} />
            {gradient}
            {expandButton}
          </div>
        )}
        {/* Body */}
        <div className={cn(size === 'sm' ? 'p-3' : 'p-4')}>
          <div className="flex items-center gap-2">
            <h3 className={cn('font-display font-semibold text-ink-primary', size === 'sm' ? 'text-sm' : 'text-base')}>
              {theme.label}
            </h3>
            {selected && <Badge>Current</Badge>}
          </div>
          {size !== 'sm' && (
            <p className="text-caption text-ink-secondary mt-1">{theme.description}</p>
          )}
          {footer && <div className="mt-4">{footer}</div>}
        </div>
      </article>
      <ThemePreviewDialog theme={theme} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
