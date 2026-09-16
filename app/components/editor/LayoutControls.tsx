'use client'
import type { Layout, Space } from '~/lib/doc'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/Select'

const SPACES: Space[] = ['-lg', '-md', '-sm', '0', 'sm', 'md', 'lg', 'xl']
const Z_LEVELS = [0, 1, 2, 3] as const

interface Props {
  layout: Layout
  onChange: (l: Layout) => void
}

export function LayoutControls({ layout, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
      <span className="font-medium">Layout</span>
      <label className="flex items-center gap-1.5">
        mt
        <Select
          value={layout.mt}
          onValueChange={v => onChange({ ...layout, mt: v as Space })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SPACES.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <label className="flex items-center gap-1.5">
        mb
        <Select
          value={layout.mb}
          onValueChange={v => onChange({ ...layout, mb: v as Space })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SPACES.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <label className="flex items-center gap-1.5">
        z
        <Select
          value={String(layout.z)}
          onValueChange={v => onChange({ ...layout, z: Number(v) as 0 | 1 | 2 | 3 })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Z_LEVELS.map(z => (
              <SelectItem key={z} value={String(z)}>{z}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    </div>
  )
}
