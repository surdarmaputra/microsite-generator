import type { HeroBlock as HeroBlockType } from '~/lib/doc'

interface Props {
  block: HeroBlockType
  isPreview?: boolean | undefined
}

export function HeroBlock({ block, isPreview }: Props) {
  if (block.props.variant === 'banner') {
    return (
      <div
        data-block-type="hero"
        data-variant="banner"
        className="relative w-full overflow-hidden"
      >
        <div
          className="w-full"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.45) 100%)',
          }}
        />
      </div>
    )
  }

  return (
    <div
      data-block-type="hero"
      data-variant="split"
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #f0f4ff 0%, white 100%)',
      }}
    >
      <div
        className="w-full"
        dangerouslySetInnerHTML={{ __html: block.html }}
      />
    </div>
  )
}
