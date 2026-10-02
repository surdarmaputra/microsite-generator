'use client'
import { listThemes } from '~/components/themes'
import { resolveTheme } from '~/lib/doc'
import type { Theme } from '~/lib/doc'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogCloseButton,
} from '~/components/ui/Dialog'
import { ThemeCard } from './ThemeCard'

export function ThemePickerDialog({
  open,
  onOpenChange,
  value,
  onChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  value: Theme
  onChange: (t: Theme) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <div className="flex items-center justify-between p-4 pb-0">
          <DialogTitle className="font-display text-base font-semibold text-ink-primary">
            Choose theme
          </DialogTitle>
          <DialogCloseButton onClose={() => onOpenChange(false)} />
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {listThemes().map(theme => {
              const id = resolveTheme(theme.id)
              return (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  size="sm"
                  selected={id === value}
                  onSelect={() => {
                    onChange(id)
                    onOpenChange(false)
                  }}
                />
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
