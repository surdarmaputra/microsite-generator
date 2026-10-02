import { useEffect, useRef, useState } from 'react'

export function useExpandableContent(clampHeight = 240) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [needsToggle, setNeedsToggle] = useState(false)
  const [measured, setMeasured] = useState(false)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const check = () => {
      setNeedsToggle(el.scrollHeight > clampHeight)
      setMeasured(true)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [clampHeight])

  const clampStyle: React.CSSProperties = !expanded && measured && needsToggle
    ? { maxHeight: `${clampHeight}px`, overflow: 'hidden' }
    : measured
    ? { maxHeight: expanded ? `${contentRef.current?.scrollHeight ?? 9999}px` : undefined }
    : { maxHeight: `${clampHeight}px`, overflow: 'hidden' }

  return { contentRef, expanded, setExpanded, needsToggle, measured, clampStyle }
}
