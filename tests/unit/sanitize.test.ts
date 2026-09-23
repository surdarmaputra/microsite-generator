import { describe, it, expect, beforeAll, vi } from 'vitest'

// PUBLIC_STORAGE_URL is read at module-load time, so we must set it before the
// first import.  Use vi.stubEnv + vi.resetModules() + dynamic import so we get
// a fresh module instance with the env var already in place.

const STORAGE = 'https://storage.example.com'

let sanitizeBlockHtml: (html: string) => string
let sanitizeCtaHref: (href: string) => string

beforeAll(async () => {
  vi.stubEnv('PUBLIC_STORAGE_URL', STORAGE)
  vi.resetModules()
  const mod = await import('~/lib/sanitize')
  sanitizeBlockHtml = mod.sanitizeBlockHtml
  sanitizeCtaHref = mod.sanitizeCtaHref
})

// ─── sanitizeBlockHtml ────────────────────────────────────────────────────────

describe('sanitizeBlockHtml', () => {
  it('allows p, h2, h3, strong, em, u, s tags', () => {
    const html = '<p>a</p><h2>b</h2><h3>c</h3><strong>d</strong><em>e</em><u>f</u><s>g</s>'
    const result = sanitizeBlockHtml(html)
    expect(result).toContain('<p>a</p>')
    expect(result).toContain('<h2>b</h2>')
    expect(result).toContain('<strong>d</strong>')
    expect(result).toContain('<em>e</em>')
  })

  it('allows a, ul, ol, li, blockquote, br tags', () => {
    const html = '<a href="https://example.com">link</a><ul><li>item</li></ul><ol><li>1</li></ol><blockquote>q</blockquote><br>'
    const result = sanitizeBlockHtml(html)
    expect(result).toContain('<a')
    expect(result).toContain('<ul>')
    expect(result).toContain('<ol>')
    expect(result).toContain('<blockquote>')
    expect(result).toContain('<br')
  })

  it('allows img with storage host src', () => {
    const html = `<img src="${STORAGE}/uploads/img.jpg" alt="test">`
    const result = sanitizeBlockHtml(html)
    expect(result).toContain('<img')
    expect(result).toContain(`${STORAGE}/uploads/img.jpg`)
  })

  it('allows iframe with youtube-nocookie src', () => {
    const html = '<iframe src="https://www.youtube-nocookie.com/embed/abc123" width="560" height="315"></iframe>'
    const result = sanitizeBlockHtml(html)
    expect(result).toContain('<iframe')
    expect(result).toContain('youtube-nocookie.com')
  })

  it('strips script tags', () => {
    const html = '<p>hello</p><script>alert("xss")</script>'
    const result = sanitizeBlockHtml(html)
    expect(result).not.toContain('<script')
    expect(result).not.toContain('alert')
    expect(result).toContain('<p>hello</p>')
  })

  it('strips onclick attributes', () => {
    const html = '<p onclick="alert(1)">click</p>'
    const result = sanitizeBlockHtml(html)
    expect(result).not.toContain('onclick')
    expect(result).toContain('<p>')
  })

  it('strips img src not starting with storage host (replaces with span)', () => {
    const html = '<img src="https://evil.com/img.jpg" alt="bad">'
    const result = sanitizeBlockHtml(html)
    expect(result).not.toContain('<img')
    expect(result).toContain('<span')
  })

  it('strips iframe src not matching youtube-nocookie (replaces with span)', () => {
    const html = '<iframe src="https://evil.com/embed/x"></iframe>'
    const result = sanitizeBlockHtml(html)
    expect(result).not.toContain('<iframe')
    expect(result).toContain('<span')
  })

  it('replaces javascript: href with #', () => {
    const html = '<a href="javascript:alert(1)">click</a>'
    const result = sanitizeBlockHtml(html)
    expect(result).toContain('href="#"')
    expect(result).not.toContain('javascript:')
  })

  it('adds rel=noopener noreferrer to all <a> tags', () => {
    const html = '<a href="https://example.com">link</a>'
    const result = sanitizeBlockHtml(html)
    expect(result).toContain('rel="noopener noreferrer"')
  })

  it('preserves text-align style on p', () => {
    const result = sanitizeBlockHtml('<p style="text-align: center;">hello</p>')
    expect(result).toContain('text-align')
    expect(result).toContain('center')
  })

  it('preserves text-align style on headings', () => {
    const result = sanitizeBlockHtml('<h2 style="text-align: right;">heading</h2>')
    expect(result).toContain('text-align')
    expect(result).toContain('right')
  })

  it('preserves hex color style on span', () => {
    const result = sanitizeBlockHtml('<span style="color: #36394a;">text</span>')
    expect(result).toContain('color')
    expect(result).toContain('#36394a')
  })

  it('strips non-hex color values', () => {
    const result = sanitizeBlockHtml('<span style="color: red;">text</span>')
    expect(result).not.toContain('color')
  })

  it('strips disallowed CSS properties but keeps text-align', () => {
    const result = sanitizeBlockHtml('<p style="font-size: 16px; text-align: center;">text</p>')
    expect(result).not.toContain('font-size')
    expect(result).toContain('text-align')
  })

  it('strips class attributes from elements', () => {
    const result = sanitizeBlockHtml('<h2 class="text-xl font-bold mt-3">heading</h2>')
    expect(result).not.toContain('class=')
    expect(result).toContain('<h2>')
  })
})

// ─── sanitizeCtaHref ─────────────────────────────────────────────────────────

describe('sanitizeCtaHref', () => {
  it('returns an https URL unchanged', () => {
    const url = 'https://example.com/path?q=1'
    expect(sanitizeCtaHref(url)).toBe(url)
  })

  it('returns a mailto URL unchanged', () => {
    const url = 'mailto:user@example.com'
    expect(sanitizeCtaHref(url)).toBe(url)
  })

  it('returns a tel URL unchanged', () => {
    const url = 'tel:+15551234567'
    expect(sanitizeCtaHref(url)).toBe(url)
  })

  it('returns a wa.me URL unchanged', () => {
    const url = 'https://wa.me/15551234567'
    expect(sanitizeCtaHref(url)).toBe(url)
  })

  it('returns # for javascript: URL', () => {
    expect(sanitizeCtaHref('javascript:alert(1)')).toBe('#')
  })

  it('returns # for a random string', () => {
    expect(sanitizeCtaHref('not-a-real-url')).toBe('#')
  })

  it('returns an http URL unchanged (https? matches http too)', () => {
    // The CTA_HREF_RE is /^(https?|mailto|tel|https:\/\/wa\.me\/).*$/ which matches http
    const url = 'http://example.com'
    expect(sanitizeCtaHref(url)).toBe(url)
  })
})
