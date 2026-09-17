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
          className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-4 pt-12"
          style={{ background: 'linear-gradient(to bottom, transparent, white)' }}
        >
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="cursor-pointer rounded-full border border-hairline bg-white px-5 py-2 text-[13px] font-semibold text-ink-primary shadow-card hover:bg-surface-hover transition-colors"
          >
            Show more
          </button>
        </div>
      )}

      {expanded && needsToggle && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="cursor-pointer mt-3 block mx-auto rounded-full border border-hairline px-5 py-2 text-[13px] font-semibold text-ink-primary hover:bg-surface-hover transition-colors"
        >
          Show less
        </button>
      )}
    </div>
  )
}
