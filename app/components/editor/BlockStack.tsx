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

  const addBlock = (type: BlockType) => {
    onChange([...blocks, defaultBlock(type)])
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

  return (
    <div className="flex flex-col gap-3">
      <div ref={containerRef} className="flex flex-col gap-3">
        {blocks.map((block, i) => (
          <div key={block.id}>
            <BlockCard
              block={block}
              onChange={b => updateBlock(i, b)}
              onDelete={() => deleteBlock(i)}
              dragHandleProps={{ 'data-drag-handle': true }}
            />
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
        + Add block
      </Button>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
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
            <Button variant="outline" size="sm" onClick={() => setPickerOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
