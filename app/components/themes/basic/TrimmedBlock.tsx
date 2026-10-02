'use client'

import type { TrimmedBlock as TrimmedBlockType } from '~/lib/doc'
import type { BlockProps } from '../registry'
import { useExpandableContent } from '../shared/useExpandableContent'

export function TrimmedBlock({ block }: BlockProps<TrimmedBlockType>) {
  const { contentRef, expanded, setExpanded, needsToggle, measured, clampStyle } = useExpandableContent(240)

  return (
    <div data-block-type="trimmed" className="theme-trimmed">
      <div style={{ ...clampStyle, transition: measured ? 'max-height 0.35s ease' : undefined }}>
        <div ref={contentRef} dangerouslySetInnerHTML={{ __html: block.html }} />
      </div>

      {!expanded && needsToggle && (
        <div className="theme-trimmed-fade">
          <button type="button" onClick={() => setExpanded(v => !v)} className="theme-trimmed-toggle">
            Show more
          </button>
        </div>
      )}

      {expanded && needsToggle && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="theme-trimmed-toggle theme-trimmed-toggle--less"
        >
          Show less
        </button>
      )}
    </div>
  )
}
