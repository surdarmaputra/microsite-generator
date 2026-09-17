import { HeroBlock } from './HeroBlock'
import { CardBlock } from './CardBlock'
import { TrimmedBlock } from './TrimmedBlock'
import { CtaBlock } from './CtaBlock'
import type { Block, Layout } from '~/lib/doc'

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

export function BlockRenderer({ block, isPreview }: { block: Block; isPreview?: boolean }) {
  const style = layoutStyles(block.layout)
  const wrapper = (children: React.ReactNode) => (
    <div style={style} key={block.id}>{children}</div>
  )
  if (block.type === 'hero') return wrapper(<HeroBlock block={block} isPreview={isPreview} />)
  if (block.type === 'card') return wrapper(<CardBlock block={block} isPreview={isPreview} />)
  if (block.type === 'trimmed') return wrapper(<TrimmedBlock block={block} isPreview={isPreview} />)
  if (block.type === 'cta') return wrapper(<CtaBlock block={block} isPreview={isPreview} />)
  return null
}
