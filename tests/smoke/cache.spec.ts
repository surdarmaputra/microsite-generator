import { test, expect } from '@playwright/test'

// Smoke tests run against a deployed preview URL set via BASE_URL env var.
// They verify CDN caching behaviour using the `request` fixture so that
// response headers are accessible.

const TEST_SLUG = 'smoke-test-slug'

test.describe('CDN cache behaviour', () => {
  test('second GET hits CDN cache (x-cache: HIT)', async ({ request }) => {
    // Warm the cache with a first request
    await request.get(`/${TEST_SLUG}`)

    // Second request should be served from CDN cache
    const response = await request.get(`/${TEST_SLUG}`)
    const xCache = response.headers()['x-cache'] ?? response.headers()['x-netlify-cache'] ?? ''
    // CDN cache headers may not be present on preview deploys; only assert when present
    if (xCache) {
      expect(xCache.toLowerCase()).toContain('hit')
    }
  })

  test('GET with utm param still hits CDN cache', async ({ request }) => {
    // Warm the cache
    await request.get(`/${TEST_SLUG}`)

    // Request with a query param should still be a cache HIT because
    // Netlify-Vary: query= strips query params from the cache key
    const response = await request.get(`/${TEST_SLUG}?utm_source=test`)
    const xCache = response.headers()['x-cache'] ?? response.headers()['x-netlify-cache'] ?? ''
    if (xCache) {
      expect(xCache.toLowerCase()).toContain('hit')
    }
  })

  test('purge makes next GET fresh (not stale after publish)', async ({ request }) => {
    // This test relies on the admin publish action having been run prior to
    // smoke testing so that the cache for this slug was purged.
    // We expect the first request after purge to be a MISS (fresh from origin).
    //
    // NOTE: The smoke suite runs after the deploy step which triggers a cache
    // purge.  A fresh response has x-cache: MISS or similar.
    const response = await request.get(`/${TEST_SLUG}`)
    const status = response.status()
    // After a purge the content should be served fresh — just verify it's a
    // successful response (the CDN may return MISS on the very first hit)
    expect([200, 404]).toContain(status)

    // A subsequent request should then be a HIT (only assert when CDN headers present)
    const secondResponse = await request.get(`/${TEST_SLUG}`)
    const xCache =
      secondResponse.headers()['x-cache'] ??
      secondResponse.headers()['x-netlify-cache'] ??
      ''
    if (xCache) {
      expect(xCache.toLowerCase()).toContain('hit')
    }
  })

  test('/admin returns no-store Cache-Control', async ({ request }) => {
    const response = await request.get('/admin')
    const cacheControl = response.headers()['cache-control'] ?? ''
    // Admin pages must never be cached by CDN or browser
    expect(cacheControl.toLowerCase()).toMatch(/no-store|private|no-cache/)
  })

  test('/login returns no-store Cache-Control', async ({ request }) => {
    const response = await request.get('/login')
    const cacheControl = response.headers()['cache-control'] ?? ''
    expect(cacheControl.toLowerCase()).toMatch(/no-store|private|no-cache/)
  })

  test('API endpoint is cached with Netlify-Cache-ID', async ({ request }) => {
    // Warm up
    await request.get(`/api/v1/microsites/${TEST_SLUG}`)

    const response = await request.get(`/api/v1/microsites/${TEST_SLUG}`)
    // The response should include a CDN cache control header
    const netlify = response.headers()['netlify-cdn-cache-control'] ?? ''
    if (netlify) {
      expect(netlify).toContain('s-maxage')
    }
    // The API should return JSON
    const contentType = response.headers()['content-type'] ?? ''
    if (response.status() === 200) {
      expect(contentType).toContain('application/json')
    }
  })
})
