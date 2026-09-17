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
      </div>
    )
  }

  return (
    <div
      data-block-type="hero"
      data-variant="split"
      className="relative w-full overflow-hidden bg-gradient-to-b from-[#f0f4ff] to-white"
    >
      <div
        className="w-full"
        dangerouslySetInnerHTML={{ __html: block.html }}
      />
    </div>
  )
}
