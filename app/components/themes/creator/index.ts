import type { ThemeManifest } from '../registry'
import { registerTheme } from '../registry'
import { HeroBlock } from './HeroBlock'
import { CardBlock } from './CardBlock'
import { TrimmedBlock } from './TrimmedBlock'
import { CtaBlock } from './CtaBlock'
import { creatorSample } from './sample'

export const creatorTheme: ThemeManifest = {
  id: 'creator',
  label: 'Creator Pop',
  description: 'Neo-brutalist bento for creators & studios — loud colour, chunky type, built for desktop and mobile',
  layout: 'responsive',
  blocks: { hero: HeroBlock, card: CardBlock, trimmed: TrimmedBlock, cta: CtaBlock },
  sample: creatorSample,
}

registerTheme(creatorTheme)
