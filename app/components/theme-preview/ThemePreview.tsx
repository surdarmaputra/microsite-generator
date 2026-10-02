'use client'
import { useRef, useState, useEffect } from 'react'
import { BlockRenderer } from '~/components/blocks/BlockRenderer'
import { sampleDoc } from './sampleDoc'
import type { Doc, Theme } from '~/lib/doc'
import { cn } from '~/components/ui/cn'

export function ThemePreview({
  theme,
  doc = sampleDoc,
  width = 390,
  interactive = false,
  className,
}: {
  theme: Theme
  doc?: Doc
  width?: number
  interactive?: boolean
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [contentHeight, setContentHeight] = useState(0)
  const [measured, setMeasured] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    function measure() {
      if (!container || !content) return
      const containerWidth = container.offsetWidth
      const newScale = Math.min(1, containerWidth / width)
      setScale(newScale)
      setContentHeight(content.scrollHeight)
      setMeasured(true)
    }

    const ro = new ResizeObserver(measure)
    ro.observe(container)
    ro.observe(content)
    measure()
    return () => ro.disconnect()
  }, [width])

  return (
    <div
      ref={containerRef}
      className={cn('overflow-hidden', className)}
      style={{ height: measured ? contentHeight * scale : undefined }}
    >
      <div
        ref={contentRef}
        className={cn('public-page', !interactive && 'pointer-events-none')}
        data-theme={theme}
        style={{
          width,
          maxWidth: 'none',
          minHeight: 0,
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          visibility: measured ? 'visible' : 'hidden',
        }}
        inert={!interactive || undefined}
        aria-hidden={interactive ? undefined : 'true'}
      >
        {doc.blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} theme={theme} isPreview />
        ))}
      </div>
    </div>
  )
}
