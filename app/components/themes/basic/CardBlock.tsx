import type { CardBlock as CardBlockType } from '~/lib/doc'
import type { BlockProps } from '../registry'

export function CardBlock({ block }: BlockProps<CardBlockType>) {
  return (
    <div data-block-type="card" className="theme-card">
      <div className="theme-card-content" dangerouslySetInnerHTML={{ __html: block.html }} />
    </div>
  )
}
