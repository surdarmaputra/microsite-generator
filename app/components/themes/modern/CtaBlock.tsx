import type { CtaBlock as CtaBlockType } from '~/lib/doc'
import type { BlockProps } from '../registry'

export function CtaBlock({ block }: BlockProps<CtaBlockType>) {
  const variant = block.props.variant ?? 'solid'
  const { href, newTab, label } = block.props
  const linkProps = {
    href,
    target: newTab ? '_blank' : undefined,
    rel: newTab ? 'noopener noreferrer' : undefined,
  }

  if (variant === 'outline') {
    return (
      <div data-block-type="cta" className="theme-cta">
        <span className="theme-cta-outline-wrap">
          <a {...linkProps} className="theme-cta-solid">
            <span>{label}</span>
            <span className="theme-cta-arrow" />
          </a>
        </span>
      </div>
    )
  }

  if (variant === 'glass') {
    return (
      <div data-block-type="cta" className="theme-cta">
        <a {...linkProps} className="theme-cta-solid theme-cta-glass">
          <span className="theme-cta-label">{label}</span>
          <span className="theme-cta-arrow" />
        </a>
      </div>
    )
  }

  return (
    <div data-block-type="cta" className="theme-cta">
      <a {...linkProps} className="theme-cta-solid">
        <span className="theme-cta-label">{label}</span>
        <span className="theme-cta-arrow" />
      </a>
    </div>
  )
}
