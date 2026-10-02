import type { ThemeManifest } from '../registry'
import { registerTheme } from '../registry'
import { HeroBlock } from './HeroBlock'
import { CardBlock } from './CardBlock'
import { TrimmedBlock } from './TrimmedBlock'
import { CtaBlock } from './CtaBlock'

export const modernTheme: ThemeManifest = {
  id: 'modern',
  label: 'Modern Classy',
  description: 'Warm, editorial, boutique — muted gold accents on cream',
  blocks: { hero: HeroBlock, card: CardBlock, trimmed: TrimmedBlock, cta: CtaBlock },
}

registerTheme(modernTheme)
