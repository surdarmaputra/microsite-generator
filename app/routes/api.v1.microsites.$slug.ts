import { createAPIFileRoute } from '@tanstack/start/api'
import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { microsites } from '~/server/db/schema'
import { notFoundCacheHeaders, apiCacheHeaders } from '~/lib/cache'

export const APIRoute = createAPIFileRoute('/api/v1/microsites/$slug')({
  GET: async ({ params }) => {
    // Query directly rather than via a server function: server functions need a
    // request context that API route handlers do not provide.
    const [site] = await db
      .select({ liveDoc: microsites.liveDoc })
      .from(microsites)
      .where(eq(microsites.slug, params.slug))

    if (!site || !site.liveDoc) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          ...notFoundCacheHeaders(params.slug),
        },
      })
    }

    const { liveDoc } = site
    const body = JSON.stringify({
      slug: params.slug,
      meta: liveDoc.meta,
      blocks: liveDoc.blocks,
    })

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        ...apiCacheHeaders(params.slug),
      },
    })
  },
})
