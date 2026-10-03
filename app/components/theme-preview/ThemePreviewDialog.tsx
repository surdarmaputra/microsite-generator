'use client'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogCloseButton,
} from '~/components/ui/Dialog'
import { SitePreview } from './SitePreview'
import { sampleDoc } from './sampleDoc'
import { resolveTheme } from '~/lib/doc'
import type { ThemeManifest } from '~/components/themes'

export function ThemePreviewDialog({
  theme,
  open,
  onOpenChange,
}: {
  theme: ThemeManifest
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <div className="flex items-center justify-between gap-4 p-6 pb-0">
          <DialogTitle className="font-display text-title-sm tracking-[-0.022em] font-semibold text-ink-primary">
            {theme.label} theme
          </DialogTitle>
          <DialogCloseButton onClose={() => onOpenChange(false)} />
        </div>
        <div className="flex h-[80vh] bg-surface-sidebar p-6">
          <SitePreview
            doc={theme.sample ?? sampleDoc}
            theme={resolveTheme(theme.id)}
            defaultDevice={theme.layout === 'responsive' ? 'desktop' : 'mobile'}
            interactive
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
