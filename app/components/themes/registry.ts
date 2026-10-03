import type { ComponentType } from 'react'
import type { Block, Doc, HeroBlock, CardBlock, TrimmedBlock, CtaBlock } from '~/lib/doc'

export interface BlockProps<T extends Block = Block> {
  block: T
  isPreview?: boolean
}

export interface ThemeBlocks {
  hero: ComponentType<BlockProps<HeroBlock>>
  card: ComponentType<BlockProps<CardBlock>>
  trimmed: ComponentType<BlockProps<TrimmedBlock>>
  cta: ComponentType<BlockProps<CtaBlock>>
}

/**
 * - `mobile`: a single ~480px column. On wide screens the page is framed as a
 *   rounded, shadowed card on a backdrop (see `.site-shell` in global.css).
 * - `responsive`: the theme fills the screen and adapts its own layout with
 *   `@container site (…)` queries, so previews at any width render correctly.
 */
export type ThemeLayout = 'mobile' | 'responsive'

export interface ThemeManifest {
  id: string
  label: string
  description: string
  layout: ThemeLayout
  blocks: ThemeBlocks
  /** Content shown when previewing the theme; defaults to the shared café sample. */
  sample?: Doc
}

const registry = new Map<string, ThemeManifest>()

export function registerTheme(manifest: ThemeManifest) {
  registry.set(manifest.id, manifest)
}

export function getTheme(id: string): ThemeManifest {
  return registry.get(id) ?? registry.get('basic')!
}

export function listThemes(): ThemeManifest[] {
  return [...registry.values()]
}
