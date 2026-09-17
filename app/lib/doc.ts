import { z } from 'zod'

export const SpaceSchema = z.enum(['-lg', '-md', '-sm', '0', 'sm', 'md', 'lg', 'xl'])
export type Space = z.infer<typeof SpaceSchema>

export const LayoutSchema = z.object({
  mt: SpaceSchema,
  mb: SpaceSchema,
  z: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
})
export type Layout = z.infer<typeof LayoutSchema>

const defaultLayout: Layout = { mt: '0', mb: '0', z: 0 }

export const HeroBlockSchema = z.object({
  id: z.string(),
  type: z.literal('hero'),
  layout: LayoutSchema.default(defaultLayout),
  props: z.object({
    variant: z.enum(['banner', 'split']),
  }),
  html: z.string(),
})

export const CardBlockSchema = z.object({
  id: z.string(),
  type: z.literal('card'),
  layout: LayoutSchema.default(defaultLayout),
  html: z.string(),
})

export const TrimmedBlockSchema = z.object({
  id: z.string(),
  type: z.literal('trimmed'),
  layout: LayoutSchema.default(defaultLayout),
  html: z.string(),
})

export const CtaBlockSchema = z.object({
  id: z.string(),
  type: z.literal('cta'),
  layout: LayoutSchema.default(defaultLayout),
  props: z.object({
    label: z.string(),
    href: z.string(),
    newTab: z.boolean(),
    variant: z.enum(['solid', 'outline', 'glass']).default('solid'),
  }),
})

export const BlockSchema = z.discriminatedUnion('type', [
  HeroBlockSchema,
  CardBlockSchema,
  TrimmedBlockSchema,
  CtaBlockSchema,
])

export type Block = z.infer<typeof BlockSchema>
export type HeroBlock = z.infer<typeof HeroBlockSchema>
export type CardBlock = z.infer<typeof CardBlockSchema>
export type TrimmedBlock = z.infer<typeof TrimmedBlockSchema>
export type CtaBlock = z.infer<typeof CtaBlockSchema>

export const MetaSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500),
  ogImage: z.string().optional(),
})
export type Meta = z.infer<typeof MetaSchema>

export const DocSchema = z.object({
  meta: MetaSchema,
  blocks: z.array(BlockSchema).max(30),
})
export type Doc = z.infer<typeof DocSchema>

export type SiteStatus = 'draft' | 'published' | 'unpublished-changes'

export function deriveSiteStatus(
  liveDoc: Doc | null,
  draftUpdatedAt: Date | null,
  publishedAt: Date | null,
): SiteStatus {
  if (!liveDoc) return 'draft'
  if (draftUpdatedAt && publishedAt && draftUpdatedAt > publishedAt) return 'unpublished-changes'
  return 'published'
}

export const RESERVED_SLUGS = new Set(['admin', 'api', 'assets', '.netlify'])

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug)
}

export function toPublicDoc(doc: Doc, storageUrl: string): Doc {
  return {
    ...doc,
    blocks: doc.blocks.map(block => {
      if (block.type === 'hero' || block.type === 'card' || block.type === 'trimmed') {
        return { ...block, html: rewriteImageSrcs(block.html, storageUrl) }
      }
      return block
    }),
  }
}

function rewriteImageSrcs(html: string, storageUrl: string): string {
  return html.replace(/(<img[^>]+src=")([^"]+)(")/g, (_match, pre, src: string, post) => {
    if (src.startsWith(storageUrl)) {
      const encoded = encodeURIComponent(src)
      return `${pre}/.netlify/images?url=${encoded}&w=800&fm=webp${post}`
    }
    return `${pre}${src}${post}`
  })
}

export const emptyDoc = (): Doc => ({
  meta: { title: '', description: '' },
  blocks: [],
})
