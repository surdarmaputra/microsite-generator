import type { CtaBlock as CtaBlockType } from '~/lib/doc'

interface Props {
  block: CtaBlockType
  isPreview?: boolean | undefined
}

export function CtaBlock({ block, isPreview }: Props) {
  return (
    <div data-block-type="cta" className="px-4">
      <a
        href={block.props.href}
        target={block.props.newTab ? '_blank' : undefined}
        rel={block.props.newTab ? 'noopener noreferrer' : undefined}
        className="group flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-transform active:scale-[0.97] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <span>{block.props.label}</span>
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
          className="transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  )
}
