import { createServerFn } from '@tanstack/start-client-core'
import { eq, and, isNotNull, sql } from 'drizzle-orm'
import { purgeCache } from '@netlify/functions'
import { db } from '~/server/db'
import { microsites } from '~/server/db/schema'
import { DocSchema, emptyDoc, isReservedSlug } from '~/lib/doc'
import { sanitizeBlockHtml, sanitizeCtaHref } from '~/lib/sanitize'
import { requireAuth } from './auth'
import { z } from 'zod'
import type { Doc } from '~/lib/doc'

function sanitizeDoc(doc: Doc): Doc {
  return {
    ...doc,
    blocks: doc.blocks.map(block => {
      if (block.type === 'hero' || block.type === 'card' || block.type === 'trimmed') {
        return { ...block, html: sanitizeBlockHtml(block.html) }
      }
      if (block.type === 'cta') {
        return { ...block, props: { ...block.props, href: sanitizeCtaHref(block.props.href) } }
      }
      return block
    }),
  }
}

async function purgeSite(slug: string) {
  try {
    await purgeCache({ tags: [`site-${slug}`] })
  } catch (e) {
    console.error(`[purgeSite] tag purge failed for site-${slug}:`, e)
  }
}

export const listSitesFn = createServerFn()
  .handler(async () => {
    await requireAuth()
    return db.select({
      id: microsites.id,
      slug: microsites.slug,
      name: microsites.name,
      draftVersion: microsites.draftVersion,
      draftUpdatedAt: microsites.draftUpdatedAt,
      publishedAt: microsites.publishedAt,
      firstPublishedAt: microsites.firstPublishedAt,
      createdAt: microsites.createdAt,
      isPublished: sql<boolean>`${microsites.liveDoc} IS NOT NULL`,
    }).from(microsites).orderBy(microsites.createdAt)
  })

export const getSiteFn = createServerFn()
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAuth()
    const [site] = await db.select().from(microsites).where(eq(microsites.id, data.id))
    if (!site) throw new Error('Not found')
    return site
  })

export const createSiteFn = createServerFn({ method: 'POST' })
  .validator((data: { name: string; slug: string }) => {
    return z.object({
      name: z.string().min(1).max(200),
      slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
    }).parse(data)
  })
  .handler(async ({ data }) => {
    await requireAuth()
    if (isReservedSlug(data.slug)) throw new Error(`Slug "${data.slug}" is reserved`)
    const [site] = await db.insert(microsites).values({
      name: data.name,
      slug: data.slug,
      draftDoc: { ...emptyDoc(), meta: { ...emptyDoc().meta, title: data.name } },
      draftVersion: 1,
    }).returning()
    return site!
  })

export const saveDraftFn = createServerFn({ method: 'POST' })
  .validator((data: { id: string; doc: unknown; version: number }) => data)
  .handler(async ({ data }) => {
    await requireAuth()
    const doc = DocSchema.parse(data.doc)
    const sanitized = sanitizeDoc(doc)
    const now = new Date()

    const result = await db.update(microsites)
      .set({ draftDoc: sanitized, draftVersion: data.version + 1, draftUpdatedAt: now })
      .where(and(eq(microsites.id, data.id), eq(microsites.draftVersion, data.version)))
      .returning({ version: microsites.draftVersion })

    if (!result[0]) throw new Error('409')
    return { version: result[0].version }
  })

export const publishFn = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAuth()
    const now = new Date()
    const [site] = await db.select().from(microsites).where(eq(microsites.id, data.id))
    if (!site) throw new Error('Not found')
    await db.update(microsites)
      .set({ liveDoc: site.draftDoc, publishedAt: now, firstPublishedAt: site.firstPublishedAt ?? now })
      .where(eq(microsites.id, data.id))
    await purgeSite(site.slug)
    return { ok: true }
  })

export const unpublishFn = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAuth()
    const [site] = await db.select({ slug: microsites.slug }).from(microsites).where(eq(microsites.id, data.id))
    if (!site) throw new Error('Not found')
    await db.update(microsites).set({ liveDoc: null, publishedAt: null }).where(eq(microsites.id, data.id))
    await purgeSite(site.slug)
    return { ok: true }
  })

export const deleteSiteFn = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAuth()
    const [site] = await db.select({ slug: microsites.slug }).from(microsites).where(eq(microsites.id, data.id))
    if (!site) throw new Error('Not found')
    await db.delete(microsites).where(eq(microsites.id, data.id))
    await purgeSite(site.slug)
    return { ok: true }
  })

export const duplicateSiteFn = createServerFn({ method: 'POST' })
  .validator((data: { id: string; newName: string; newSlug: string }) => {
    return z.object({
      id: z.string().uuid(),
      newName: z.string().min(1).max(200),
      newSlug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
    }).parse(data)
  })
  .handler(async ({ data }) => {
    await requireAuth()
    if (isReservedSlug(data.newSlug)) throw new Error('Reserved slug')
    const [source] = await db.select().from(microsites).where(eq(microsites.id, data.id))
    if (!source) throw new Error('Not found')
    const [newSite] = await db.insert(microsites).values({
      name: data.newName,
      slug: data.newSlug,
      draftDoc: source.draftDoc,
      draftVersion: 1,
    }).returning()
    return newSite!
  })

export const getLiveDocFn = createServerFn()
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const [site] = await db.select({
      liveDoc: microsites.liveDoc,
      slug: microsites.slug,
      draftDoc: microsites.draftDoc,
      name: microsites.name,
    }).from(microsites).where(eq(microsites.slug, data.slug))
    return site ?? null
  })
