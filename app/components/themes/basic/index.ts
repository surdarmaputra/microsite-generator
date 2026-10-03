import type { ThemeManifest } from '../registry'
import { registerTheme } from '../registry'
import { HeroBlock } from './HeroBlock'
import { CardBlock } from './CardBlock'
import { TrimmedBlock } from './TrimmedBlock'
import { CtaBlock } from './CtaBlock'

export const basicTheme: ThemeManifest = {
  id: 'basic',
  label: 'Basic',
  description: 'Clean, corporate, bright — the default look',
  layout: 'mobile',
  blocks: { hero: HeroBlock, card: CardBlock, trimmed: TrimmedBlock, cta: CtaBlock },
}

registerTheme(basicTheme)
