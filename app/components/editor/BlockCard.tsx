'use client'
import type { Block } from '~/lib/doc'
import { LayoutControls } from './LayoutControls'
import { LexicalEditor } from './LexicalEditor'
import { Badge } from '~/components/ui/Badge'
import { Button } from '~/components/ui/Button'
import { Input } from '~/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/Select'

interface Props {
  block: Block
  onChange: (b: Block) => void
  onDelete: () => void
  dragHandleProps?: object
}

export function BlockCard({ block, onChange, onDelete, dragHandleProps }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
        <Badge variant="draft">{block.type}</Badge>
        <div
          {...dragHandleProps}
          className="ml-1 cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
          title="Drag to reorder"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="4" cy="4" r="1.2" fill="currentColor" />
            <circle cx="10" cy="4" r="1.2" fill="currentColor" />
            <circle cx="4" cy="10" r="1.2" fill="currentColor" />
            <circle cx="10" cy="10" r="1.2" fill="currentColor" />
          </svg>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-7 w-7 p-0 text-gray-400 hover:text-red-600"
          onClick={onDelete}
          title="Delete block"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </Button>
      </div>

      <div className="flex flex-col gap-3 p-3">
        <LayoutControls
          layout={block.layout}
          onChange={l => onChange({ ...block, layout: l })}
        />

        {block.type === 'hero' && (
          <>
            <Select
              value={block.props.variant}
              onValueChange={v =>
                onChange({ ...block, props: { ...block.props, variant: v as 'banner' | 'split' } })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="banner">Banner</SelectItem>
                <SelectItem value="split">Split</SelectItem>
              </SelectContent>
            </Select>
            <LexicalEditor
              value={block.html}
              onChange={html => onChange({ ...block, html })}
              placeholder="Hero content…"
            />
          </>
        )}

        {block.type === 'card' && (
          <LexicalEditor
            value={block.html}
            onChange={html => onChange({ ...block, html })}
            placeholder="Card content…"
          />
        )}

        {block.type === 'trimmed' && (
          <LexicalEditor
            value={block.html}
            onChange={html => onChange({ ...block, html })}
            placeholder="Trimmed content…"
          />
        )}

        {block.type === 'cta' && (
          <div className="flex flex-col gap-2">
            <Input
              label="Label"
              value={block.props.label}
              onChange={e => onChange({ ...block, props: { ...block.props, label: e.target.value } })}
              placeholder="Button label"
            />
            <Input
              label="URL"
              type="url"
              value={block.props.href}
              onChange={e => onChange({ ...block, props: { ...block.props, href: e.target.value } })}
              placeholder="https://…"
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={block.props.newTab}
                onChange={e => onChange({ ...block, props: { ...block.props, newTab: e.target.checked } })}
                className="rounded border-gray-300"
              />
              Open in new tab
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
