import { describe, it, expect } from 'vitest'
import {
  DocSchema,
  deriveSiteStatus,
  isReservedSlug,
  toPublicDoc,
} from '~/lib/doc'

// ─── DocSchema.parse ─────────────────────────────────────────────────────────

describe('DocSchema.parse', () => {
  const defaultLayout = { mt: '0' as const, mb: '0' as const, z: 0 as const }

  it('accepts a valid doc with all 4 block types', () => {
    const doc = {
      meta: { title: 'Hello', description: 'World' },
      blocks: [
        { id: 'b1', type: 'hero', layout: defaultLayout, props: { variant: 'banner' }, html: '<p>Hi</p>' },
        { id: 'b2', type: 'card', layout: defaultLayout, html: '<p>Card</p>' },
        { id: 'b3', type: 'trimmed', layout: defaultLayout, html: '<p>Trimmed</p>' },
        { id: 'b4', type: 'cta', layout: defaultLayout, props: { label: 'Click', href: 'https://example.com', newTab: false } },
      ],
    }
    expect(() => DocSchema.parse(doc)).not.toThrow()
    const parsed = DocSchema.parse(doc)
    expect(parsed.blocks).toHaveLength(4)
  })

  it('rejects a doc with more than 30 blocks', () => {
    const blocks = Array.from({ length: 31 }, (_, i) => ({
      id: `b${i}`,
      type: 'card' as const,
      layout: defaultLayout,
      html: `<p>block ${i}</p>`,
    }))
    const doc = { meta: { title: 'T', description: '' }, blocks }
    expect(() => DocSchema.parse(doc)).toThrow()
  })

  it('rejects a doc with an unknown block type', () => {
    const doc = {
      meta: { title: 'T', description: '' },
      blocks: [
        { id: 'b1', type: 'unknown', layout: defaultLayout, html: '<p>?</p>' },
      ],
    }
    expect(() => DocSchema.parse(doc)).toThrow()
  })

  it('rejects a block with an invalid Space value', () => {
    const doc = {
      meta: { title: 'T', description: '' },
      blocks: [
        { id: 'b1', type: 'card', layout: { mt: 'huge', mb: '0', z: 0 }, html: '<p>x</p>' },
      ],
    }
    expect(() => DocSchema.parse(doc)).toThrow()
  })
})

// ─── deriveSiteStatus ─────────────────────────────────────────────────────────

describe('deriveSiteStatus', () => {
  const someDoc = DocSchema.parse({ meta: { title: 'T', description: '' }, blocks: [] })

  it("returns 'draft' when liveDoc is null", () => {
    expect(deriveSiteStatus(null, new Date(), new Date())).toBe('draft')
  })

  it("returns 'published' when draftUpdatedAt <= publishedAt", () => {
    const publishedAt = new Date('2024-01-10T12:00:00Z')
    const draftUpdatedAt = new Date('2024-01-10T12:00:00Z')
    expect(deriveSiteStatus(someDoc, draftUpdatedAt, publishedAt)).toBe('published')
  })

  it("returns 'published' when draftUpdatedAt is before publishedAt", () => {
    const publishedAt = new Date('2024-01-10T12:00:00Z')
    const draftUpdatedAt = new Date('2024-01-09T08:00:00Z')
    expect(deriveSiteStatus(someDoc, draftUpdatedAt, publishedAt)).toBe('published')
  })

  it("returns 'unpublished-changes' when draftUpdatedAt > publishedAt", () => {
    const publishedAt = new Date('2024-01-10T12:00:00Z')
    const draftUpdatedAt = new Date('2024-01-11T08:00:00Z')
    expect(deriveSiteStatus(someDoc, draftUpdatedAt, publishedAt)).toBe('unpublished-changes')
  })

  it("returns 'published' when publishedAt is null but liveDoc exists", () => {
    expect(deriveSiteStatus(someDoc, new Date(), null)).toBe('published')
  })
})

// ─── isReservedSlug ───────────────────────────────────────────────────────────

describe('isReservedSlug', () => {
  it.each(['admin', 'api', 'assets', '.netlify'])('returns true for reserved slug "%s"', slug => {
    expect(isReservedSlug(slug)).toBe(true)
  })

  it('returns false for a normal slug', () => {
    expect(isReservedSlug('my-site')).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(isReservedSlug('')).toBe(false)
  })
})

// ─── toPublicDoc ──────────────────────────────────────────────────────────────

describe('toPublicDoc', () => {
  const storageUrl = 'https://storage.example.com'
  const defaultLayout = { mt: '0' as const, mb: '0' as const, z: 0 as const }

  it('rewrites img src starting with storageUrl to the Netlify CDN URL', () => {
    const doc = DocSchema.parse({
      meta: { title: 'T', description: '' },
      blocks: [
        {
          id: 'b1',
          type: 'card',
          layout: defaultLayout,
          html: `<img src="${storageUrl}/uploads/img.jpg" alt="test">`,
        },
      ],
    })
    const result = toPublicDoc(doc, storageUrl)
    const cardBlock = result.blocks[0]!
    if (cardBlock.type !== 'card') throw new Error('expected card')
    expect(cardBlock.html).toContain('/.netlify/images?url=')
    expect(cardBlock.html).toContain('fm=webp')
    expect(cardBlock.html).not.toContain(`${storageUrl}/uploads/img.jpg"`)
  })

  it('leaves non-storage img src unchanged', () => {
    const externalSrc = 'https://cdn.other.com/image.png'
    const doc = DocSchema.parse({
      meta: { title: 'T', description: '' },
      blocks: [
        {
          id: 'b1',
          type: 'card',
          layout: defaultLayout,
          html: `<img src="${externalSrc}" alt="test">`,
        },
      ],
    })
    const result = toPublicDoc(doc, storageUrl)
    const cardBlock = result.blocks[0]!
    if (cardBlock.type !== 'card') throw new Error('expected card')
    expect(cardBlock.html).toContain(externalSrc)
    expect(cardBlock.html).not.toContain('/.netlify/images')
  })

  it('rewrites imgs inside hero blocks', () => {
    const doc = DocSchema.parse({
      meta: { title: 'T', description: '' },
      blocks: [
        {
          id: 'b1',
          type: 'hero',
          layout: defaultLayout,
          props: { variant: 'banner' },
          html: `<img src="${storageUrl}/hero.jpg">`,
        },
      ],
    })
    const result = toPublicDoc(doc, storageUrl)
    const heroBlock = result.blocks[0]!
    if (heroBlock.type !== 'hero') throw new Error('expected hero')
    expect(heroBlock.html).toContain('/.netlify/images?url=')
  })

  it('rewrites imgs inside trimmed blocks', () => {
    const doc = DocSchema.parse({
      meta: { title: 'T', description: '' },
      blocks: [
        {
          id: 'b1',
          type: 'trimmed',
          layout: defaultLayout,
          html: `<img src="${storageUrl}/trimmed.jpg">`,
        },
      ],
    })
    const result = toPublicDoc(doc, storageUrl)
    const block = result.blocks[0]!
    if (block.type !== 'trimmed') throw new Error('expected trimmed')
    expect(block.html).toContain('/.netlify/images?url=')
  })

  it('does not modify cta blocks', () => {
    const doc = DocSchema.parse({
      meta: { title: 'T', description: '' },
      blocks: [
        {
          id: 'b1',
          type: 'cta',
          layout: defaultLayout,
          props: { label: 'Go', href: 'https://example.com', newTab: false },
        },
      ],
    })
    const result = toPublicDoc(doc, storageUrl)
    expect(result.blocks[0]).toEqual(doc.blocks[0])
  })
})
