'use client'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogCloseButton,
} from '~/components/ui/Dialog'
import { ThemePreview } from './ThemePreview'
import { DeviceFrame } from './DeviceFrame'
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
      <DialogContent className="sm:max-w-3xl">
        <div className="flex items-center justify-between gap-4 p-6 pb-0">
          <DialogTitle className="font-display text-title-sm tracking-[-0.022em] font-semibold text-ink-primary">
            {theme.label} theme
          </DialogTitle>
          <DialogCloseButton onClose={() => onOpenChange(false)} />
        </div>
        <div className="flex justify-center bg-surface-sidebar p-6">
          <DeviceFrame className="h-[75vh] w-full max-w-[406px]">
            <ThemePreview theme={resolveTheme(theme.id)} interactive />
          </DeviceFrame>
        </div>
      </DialogContent>
    </Dialog>
  )
}
