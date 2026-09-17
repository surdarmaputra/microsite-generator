import type { CtaBlock as CtaBlockType } from '~/lib/doc'

interface Props {
  block: CtaBlockType
  isPreview?: boolean | undefined
}

const Arrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-transform duration-150 group-hover:translate-x-1"
    aria-hidden="true"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

export function CtaBlock({ block, isPreview }: Props) {
  const variant = block.props.variant ?? 'solid'
  const { href, newTab, label } = block.props
  const linkProps = {
    href,
    target: newTab ? '_blank' : undefined,
    rel: newTab ? 'noopener noreferrer' : undefined,
  }

  if (variant === 'outline') {
    return (
      <div data-block-type="cta" className="px-4">
        <a
          {...linkProps}
          className="cta-outline group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3.5 text-base font-semibold transition-all duration-150 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-[#0f77ff] focus:ring-offset-2"
        >
          <span className="relative z-10">{label}</span>
          <span className="relative z-10"><Arrow /></span>
        </a>
      </div>
    )
  }

  if (variant === 'glass') {
    return (
      <div data-block-type="cta" className="px-4">
        <a
          {...linkProps}
          className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/40 bg-white/20 px-6 py-3.5 text-base font-semibold text-[#091135] backdrop-blur-sm transition-all duration-150 hover:bg-white/35 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-[#0f77ff] focus:ring-offset-2"
          style={{ boxShadow: '0 2px 16px rgba(9,17,53,0.08), inset 0 1px 0 rgba(255,255,255,0.6)' }}
        >
          <span>{label}</span>
          <Arrow />
        </a>
      </div>
    )
  }

  return (
    <div data-block-type="cta" className="px-4">
      <a
        {...linkProps}
        className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#0f77ff] px-6 py-3.5 text-base font-semibold text-white transition-all duration-150 hover:bg-[#1070c9] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-[#0f77ff] focus:ring-offset-2"
      >
        <span>{label}</span>
        <Arrow />
      </a>
    </div>
  )
}
