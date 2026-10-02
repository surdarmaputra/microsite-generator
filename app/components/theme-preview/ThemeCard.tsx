'use client'
import { useState, type ReactNode } from 'react'
import { Maximize2 } from 'lucide-react'
import { ThemePreview } from './ThemePreview'
import { ThemePreviewDialog } from './ThemePreviewDialog'
import { resolveTheme } from '~/lib/doc'
import type { ThemeManifest } from '~/components/themes'

export function ThemeCard({ theme, footer }: { theme: ThemeManifest; footer?: ReactNode }) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <article
        aria-label={theme.label}
        className="rounded-card border-hairline bg-surface-card shadow-card border overflow-hidden"
      >
        {/* Preview window */}
        <div className="relative h-72 overflow-hidden">
          <ThemePreview theme={resolveTheme(theme.id)} />
          {/* Bottom gradient fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-card to-transparent" />
          {/* Expand button */}
          <button
            type="button"
            aria-label={`Expand ${theme.label} preview`}
            onClick={() => setDialogOpen(true)}
            className="absolute top-2 right-2 rounded-control bg-surface-card/80 text-ink-secondary hover:bg-surface-card hover:text-ink-primary grid size-8 place-items-center transition-colors"
          >
            <Maximize2 size={14} />
          </button>
        </div>
        {/* Body */}
        <div className="p-4">
          <h3 className="font-display text-base font-semibold text-ink-primary">{theme.label}</h3>
          <p className="text-caption text-ink-secondary mt-1">{theme.description}</p>
          {footer && <div className="mt-4">{footer}</div>}
        </div>
      </article>
      <ThemePreviewDialog theme={theme} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
