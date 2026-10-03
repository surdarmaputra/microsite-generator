import { getTheme } from '~/components/themes'
import type { Block, Layout, Theme } from '~/lib/doc'

function layoutStyles(layout: Layout): React.CSSProperties {
  const spaceMap: Record<string, string> = {
    '-lg': '-2rem', '-md': '-1rem', '-sm': '-0.5rem', '0': '0',
    'sm': '0.5rem', 'md': '1rem', 'lg': '2rem', 'xl': '3rem',
  }
  return {
    marginTop: spaceMap[layout.mt] ?? '0',
    marginBottom: spaceMap[layout.mb] ?? '0',
    position: layout.z > 0 ? 'relative' : undefined,
    zIndex: layout.z > 0 ? layout.z : undefined,
  }
}

/**
 * Renders one block with the given theme's components. The theme's CSS only
 * applies inside an ancestor carrying the matching `data-theme` attribute.
 */
export function BlockRenderer({ block, isPreview = false, theme = 'basic' }: {
  block: Block
  isPreview?: boolean
  theme?: Theme
}) {
  const { blocks } = getTheme(theme)
  const content = (() => {
    switch (block.type) {
      case 'hero': return <blocks.hero block={block} isPreview={isPreview} />
      case 'card': return <blocks.card block={block} isPreview={isPreview} />
      case 'trimmed': return <blocks.trimmed block={block} isPreview={isPreview} />
      case 'cta': return <blocks.cta block={block} isPreview={isPreview} />
      default: return null
    }
  })()
  if (!content) return null
  // `data-block-slot` lets responsive themes place blocks in a page grid.
  return <div data-block-slot={block.type} style={layoutStyles(block.layout)}>{content}</div>
}
