import type { CardBlock as CardBlockType } from '~/lib/doc'

interface Props {
  block: CardBlockType
  isPreview?: boolean | undefined
}

export function CardBlock({ block, isPreview }: Props) {
  return (
    <div
      data-block-type="card"
      className="rounded-2xl bg-[var(--color-surface)] shadow-sm mx-4 px-4 py-4"
    >
      <div dangerouslySetInnerHTML={{ __html: block.html }} />
    </div>
  )
}
