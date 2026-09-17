'use client'
import { useState } from 'react'
import { ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react'
import type { Block } from '~/lib/doc'
import { LayoutControls } from './LayoutControls'
import { LexicalEditor } from './LexicalEditor'
import { Badge } from '~/components/ui/Badge'
import { Input } from '~/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/Select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '~/components/ui/DropdownMenu'

interface Props {
  block: Block
  isNew?: boolean
  onChange: (b: Block) => void
  onDelete: () => void
  onInsertAbove: () => void
  onInsertBelow: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onMoveFirst: () => void
  onMoveLast: () => void
  dragHandleProps?: object
}

export function BlockCard({
  block,
  isNew,
  onChange,
  onDelete,
  onInsertAbove,
  onInsertBelow,
  onMoveUp,
  onMoveDown,
  onMoveFirst,
  onMoveLast,
  dragHandleProps,
}: Props) {
  const [collapsed, setCollapsed] = useState(!isNew)

  return (
    <div className="rounded-card border-hairline bg-surface-card border">
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: collapsed ? 'none' : '1px solid var(--color-hairline)' }}>
        <div
          {...dragHandleProps}
          className="cursor-grab text-ink-secondary hover:text-ink-primary active:cursor-grabbing transition-colors shrink-0"
          title="Drag to reorder"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="4" cy="4" r="1.2" fill="currentColor" />
            <circle cx="10" cy="4" r="1.2" fill="currentColor" />
            <circle cx="4" cy="10" r="1.2" fill="currentColor" />
            <circle cx="10" cy="10" r="1.2" fill="currentColor" />
          </svg>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
          aria-label={collapsed ? 'Expand block' : 'Collapse block'}
        >
          {collapsed
            ? <ChevronRight size={14} className="text-ink-secondary shrink-0" />
            : <ChevronDown size={14} className="text-ink-secondary shrink-0" />
          }
          <Badge variant="draft">{block.type}</Badge>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-control grid size-7 place-items-center text-ink-secondary hover:bg-surface-hover hover:text-ink-primary transition-colors shrink-0"
              title="More options"
            >
              <MoreHorizontal size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onInsertAbove}>Add above</DropdownMenuItem>
            <DropdownMenuItem onSelect={onInsertBelow}>Add below</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onMoveUp}>Move up</DropdownMenuItem>
            <DropdownMenuItem onSelect={onMoveDown}>Move down</DropdownMenuItem>
            <DropdownMenuItem onSelect={onMoveFirst}>Move to first</DropdownMenuItem>
            <DropdownMenuItem onSelect={onMoveLast}>Move to last</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onDelete}
              className="text-danger data-[highlighted]:bg-danger/10 data-[highlighted]:text-danger"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {!collapsed && (
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
              <Select
                value={block.props.variant ?? 'solid'}
                onValueChange={v =>
                  onChange({ ...block, props: { ...block.props, variant: v as 'solid' | 'outline' | 'glass' } })
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="glass">Glass</SelectItem>
                </SelectContent>
              </Select>
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
              <label className="flex items-center gap-2 text-caption text-ink-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={block.props.newTab}
                  onChange={e => onChange({ ...block, props: { ...block.props, newTab: e.target.checked } })}
                  className="rounded border-hairline accent-accent"
                />
                Open in new tab
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
