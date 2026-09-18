'use client'
import { useEffect, useRef, useState } from 'react'
import Sortable from 'sortablejs'
import type { Block } from '~/lib/doc'
import { BlockCard } from './BlockCard'
import { Button } from '~/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/Dialog'

interface Props {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
}

type BlockType = 'hero' | 'card' | 'trimmed' | 'cta'

const defaultBlock = (type: BlockType): Block => {
  const id = crypto.randomUUID()
  const layout = { mt: '0' as const, mb: '0' as const, z: 0 as const }
  if (type === 'hero') return { id, type, layout, props: { variant: 'banner' }, html: '' }
  if (type === 'card') return { id, type, layout, html: '' }
  if (type === 'trimmed') return { id, type, layout, html: '' }
  return { id, type: 'cta', layout, props: { label: '', href: '', newTab: false, variant: 'solid' as const } }
}

export function BlockStack({ blocks, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const blocksRef = useRef(blocks)
  blocksRef.current = blocks

  const [pickerOpen, setPickerOpen] = useState(false)
  const [newIds, setNewIds] = useState<Set<string>>(() => new Set())
  const [insertAt, setInsertAt] = useState<number | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const sortable = Sortable.create(el, {
      handle: '[data-drag-handle]',
      animation: 150,
      onEnd(evt) {
        const oldIndex = evt.oldIndex
        const newIndex = evt.newIndex
        if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return
        const next = [...blocksRef.current]
        const [moved] = next.splice(oldIndex, 1)
        if (moved) next.splice(newIndex, 0, moved)
        onChange(next)
      },
    })
    return () => sortable.destroy()
  }, [])

  const openPicker = (at?: number) => {
    setInsertAt(at ?? null)
    setPickerOpen(true)
  }

  const addBlock = (type: BlockType) => {
    const block = defaultBlock(type)
    setNewIds(prev => new Set([...prev, block.id]))
    if (insertAt !== null) {
      const next = [...blocks]
      next.splice(insertAt, 0, block)
      onChange(next)
    } else {
      onChange([...blocks, block])
    }
    setInsertAt(null)
    setPickerOpen(false)
  }

  const updateBlock = (index: number, block: Block) => {
    const next = [...blocks]
    next[index] = block
    onChange(next)
  }

  const deleteBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index))
  }

  const moveBlock = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= blocks.length) return
    const next = [...blocks]
    const [moved] = next.splice(fromIndex, 1)
    if (moved) next.splice(toIndex, 0, moved)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <div ref={containerRef} className="flex flex-col gap-3">
        {blocks.map((block, i) => (
          <div key={block.id}>
            <BlockCard
              block={block}
              isNew={newIds.has(block.id)}
              onChange={b => updateBlock(i, b)}
              onDelete={() => deleteBlock(i)}
              onInsertAbove={() => openPicker(i)}
              onInsertBelow={() => openPicker(i + 1)}
              onMoveUp={() => moveBlock(i, i - 1)}
              onMoveDown={() => moveBlock(i, i + 1)}
              onMoveFirst={() => moveBlock(i, 0)}
              onMoveLast={() => moveBlock(i, blocks.length - 1)}
              dragHandleProps={{ 'data-drag-handle': true }}
            />
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={() => openPicker()}>
        + Add block
      </Button>

      <Dialog open={pickerOpen} onOpenChange={open => { setPickerOpen(open); if (!open) setInsertAt(null) }}>
        <DialogContent>
          <DialogTitle className="font-display text-title-sm tracking-[-0.022em] font-semibold text-ink-primary">
            Add block
          </DialogTitle>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(['hero', 'card', 'trimmed', 'cta'] as BlockType[]).map(type => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className="rounded-card border-hairline bg-surface-card hover:bg-surface-hover text-caption font-medium text-ink-primary border p-4 text-left capitalize transition-colors"
              >
                {type}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setPickerOpen(false); setInsertAt(null) }}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
