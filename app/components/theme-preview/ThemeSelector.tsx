'use client'
import { useState } from 'react'
import { Palette } from 'lucide-react'
import { Button } from '~/components/ui/Button'
import { getTheme } from '~/components/themes'
import { ThemePickerDialog } from './ThemePickerDialog'
import type { Theme } from '~/lib/doc'
import { cn } from '~/components/ui/cn'

export function ThemeSelector({
  value,
  onChange,
  className,
}: {
  value: Theme
  onChange: (t: Theme) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        aria-label="Theme"
        onClick={() => setOpen(true)}
        className={cn('flex items-center gap-1.5', className)}
      >
        <Palette size={14} />
        {getTheme(value).label}
      </Button>
      <ThemePickerDialog
        open={open}
        onOpenChange={setOpen}
        value={value}
        onChange={onChange}
      />
    </>
  )
}
