import { describe, it, expect } from 'vitest'
import { publicCacheHeaders, notFoundCacheHeaders, apiCacheHeaders } from '~/lib/cache'

describe('publicCacheHeaders', () => {
  it('returns a Netlify-CDN-Cache-Control header with long TTL', () => {
    const headers = publicCacheHeaders('my-site')
    expect(headers['Netlify-CDN-Cache-Control']).toContain('s-maxage=31536000')
    expect(headers['Netlify-CDN-Cache-Control']).toContain('public')
    expect(headers['Netlify-CDN-Cache-Control']).toContain('durable')
  })

  it('includes Cache-Tag with the slug', () => {
    const headers = publicCacheHeaders('my-site')
    expect(headers['Cache-Tag']).toBe('site-my-site')
  })

  it('uses must-revalidate in browser Cache-Control', () => {
    const headers = publicCacheHeaders('slug-x')
    expect(headers['Cache-Control']).toContain('must-revalidate')
  })

  it('includes Netlify-Vary header', () => {
    const headers = publicCacheHeaders('slug-x')
    expect(headers['Netlify-Vary']).toBeDefined()
  })

  it('uses the provided slug in the Cache-Tag', () => {
    const headers = publicCacheHeaders('campaign-2024')
    expect(headers['Cache-Tag']).toBe('site-campaign-2024')
  })
})

describe('notFoundCacheHeaders', () => {
  it('includes s-maxage=60 in Netlify-CDN-Cache-Control', () => {
    const headers = notFoundCacheHeaders('missing')
    expect(headers['Netlify-CDN-Cache-Control']).toContain('s-maxage=60')
  })

  it('includes Cache-Tag with the slug', () => {
    const headers = notFoundCacheHeaders('missing')
    expect(headers['Cache-Tag']).toBe('site-missing')
  })

  it('includes public in Cache-Control', () => {
    const headers = notFoundCacheHeaders('missing')
    expect(headers['Cache-Control']).toContain('public')
  })

  it('uses a shorter TTL than publicCacheHeaders', () => {
    const notFoundHdr = notFoundCacheHeaders('x')
    const publicHdr = publicCacheHeaders('x')
    const extract = (h: string | undefined) => {
      if (!h) return 0
      const m = h.match(/s-maxage=(\d+)/)
      return m?.[1] ? parseInt(m[1], 10) : 0
    }
    expect(extract(notFoundHdr['Netlify-CDN-Cache-Control'])).toBeLessThan(
      extract(publicHdr['Netlify-CDN-Cache-Control']),
    )
  })
})

describe('apiCacheHeaders', () => {
  it('uses Netlify-Cache-ID (not Cache-Tag)', () => {
    const headers = apiCacheHeaders('my-api-site')
    expect(headers['Netlify-Cache-ID']).toBe('site-my-api-site')
    expect(headers['Cache-Tag']).toBeUndefined()
  })

  it('includes long TTL in Netlify-CDN-Cache-Control', () => {
    const headers = apiCacheHeaders('api-site')
    expect(headers['Netlify-CDN-Cache-Control']).toContain('s-maxage=31536000')
  })

  it('includes must-revalidate in Cache-Control', () => {
    const headers = apiCacheHeaders('api-site')
    expect(headers['Cache-Control']).toContain('must-revalidate')
  })

  it('uses the provided slug in Netlify-Cache-ID', () => {
    const headers = apiCacheHeaders('special-slug')
    expect(headers['Netlify-Cache-ID']).toBe('site-special-slug')
  })
})
