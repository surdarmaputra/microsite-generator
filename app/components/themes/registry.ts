import type { ComponentType } from 'react'
import type { Block, HeroBlock, CardBlock, TrimmedBlock, CtaBlock } from '~/lib/doc'

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

export interface ThemeManifest {
  id: string
  label: string
  description: string
  blocks: ThemeBlocks
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
