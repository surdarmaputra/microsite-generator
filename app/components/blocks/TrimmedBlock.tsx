'use client'

import { useEffect, useRef, useState } from 'react'
import type { TrimmedBlock as TrimmedBlockType } from '~/lib/doc'

const CLAMP_HEIGHT = 240

interface Props {
  block: TrimmedBlockType
  isPreview?: boolean | undefined
}

export function TrimmedBlock({ block, isPreview }: Props) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [needsToggle, setNeedsToggle] = useState(false)
  const [measured, setMeasured] = useState(false)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const check = () => {
      setNeedsToggle(el.scrollHeight > CLAMP_HEIGHT)
      setMeasured(true)
    }

    check()

    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const clampStyle: React.CSSProperties = !expanded && measured && needsToggle
    ? { maxHeight: `${CLAMP_HEIGHT}px`, overflow: 'hidden' }
    : measured
    ? { maxHeight: expanded ? `${contentRef.current?.scrollHeight ?? 9999}px` : undefined }
    : { maxHeight: `${CLAMP_HEIGHT}px`, overflow: 'hidden' }

  return (
    <div data-block-type="trimmed" className="relative px-4">
      <div
        style={{
          ...clampStyle,
          transition: measured ? 'max-height 0.35s ease' : undefined,
        }}
      >
        <div
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      </div>

      {!expanded && needsToggle && (
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, white)',
          }}
        />
      )}

      {needsToggle && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="mt-2 text-sm font-medium text-blue-600 hover:underline focus:outline-none"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}
