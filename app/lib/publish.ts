import { purgeCache } from '@netlify/functions'

type Purge = (opts: { tags: string[] }) => Promise<unknown>

export function siteTag(slug: string): string {
  return `site-${slug}`
}

export function publishValues<D>(
  site: { draftDoc: D; firstPublishedAt: Date | null },
  now: Date,
) {
  return {
    liveDoc: site.draftDoc,
    publishedAt: now,
    firstPublishedAt: site.firstPublishedAt ?? now,
  }
}

export const UNPUBLISH_VALUES = { liveDoc: null, publishedAt: null } as const

export async function purgeSite(slug: string, purge: Purge = purgeCache): Promise<void> {
  try {
    await purge({ tags: [siteTag(slug)] })
  } catch (e) {
    console.error(`[purgeSite] tag purge failed for ${siteTag(slug)}:`, e)
  }
}
