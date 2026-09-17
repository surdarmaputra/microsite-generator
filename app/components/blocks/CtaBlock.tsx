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

const solidClass =
  'group flex w-full items-center justify-center gap-2 rounded-full bg-[#0f77ff] px-6 py-3.5 text-base font-semibold text-white transition-all duration-150 hover:bg-[#1070c9] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-[#0f77ff] focus:ring-offset-2'

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
        <span className="cta-outline-wrap">
          <a {...linkProps} className={solidClass}>
            <span>{label}</span>
            <Arrow />
          </a>
        </span>
      </div>
    )
  }

  if (variant === 'glass') {
    return (
      <div data-block-type="cta" className="px-4">
        <a
          {...linkProps}
          className={`cta-glass ${solidClass}`}
        >
          <span className="relative z-10">{label}</span>
          <span className="relative z-10"><Arrow /></span>
        </a>
      </div>
    )
  }

  return (
    <div data-block-type="cta" className="px-4">
      <a {...linkProps} className={solidClass}>
        <span>{label}</span>
        <Arrow />
      </a>
    </div>
  )
}
