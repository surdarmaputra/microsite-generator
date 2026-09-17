import type { CardBlock as CardBlockType } from '~/lib/doc'

interface Props {
  block: CardBlockType
  isPreview?: boolean | undefined
}

export function CardBlock({ block, isPreview }: Props) {
  return (
    <div
      data-block-type="card"
      className="mx-4 rounded-2xl border border-[#eef1f6] bg-white px-4 py-5 shadow-[0_2px_8px_-2px_rgba(9,17,53,0.04),0_12px_32px_-8px_rgba(9,17,53,0.08)]"
    >
      <div dangerouslySetInnerHTML={{ __html: block.html }} />
    </div>
  )
}
