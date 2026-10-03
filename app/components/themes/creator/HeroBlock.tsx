import type { HeroBlock as HeroBlockType } from '~/lib/doc'
import type { BlockProps } from '../registry'

export function HeroBlock({ block }: BlockProps<HeroBlockType>) {
  if (block.props.variant === 'banner') {
    return (
      <div data-block-type="hero" data-variant="banner" className="theme-hero-banner">
        <div className="theme-hero-content" dangerouslySetInnerHTML={{ __html: block.html }} />
      </div>
    )
  }

  return (
    <div data-block-type="hero" data-variant="split" className="theme-hero-split">
      <div className="theme-hero-content" dangerouslySetInnerHTML={{ __html: block.html }} />
      {/* Decorative spinning starburst sticker */}
      <span className="theme-hero-sticker" aria-hidden="true" />
    </div>
  )
}
