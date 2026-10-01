import { describe, it, expect, vi } from 'vitest'
import { publishValues, purgeSite, siteTag, UNPUBLISH_VALUES } from '~/lib/publish'

describe('siteTag', () => {
  it('prefixes slug', () => expect(siteTag('foo')).toBe('site-foo'))
})

describe('publishValues', () => {
  const now = new Date('2026-01-02')
  it('sets firstPublishedAt on first publish', () => {
    const v = publishValues({ draftDoc: { a: 1 }, firstPublishedAt: null }, now)
    expect(v).toEqual({ liveDoc: { a: 1 }, publishedAt: now, firstPublishedAt: now })
  })
  it('keeps firstPublishedAt on republish', () => {
    const first = new Date('2025-01-01')
    const v = publishValues({ draftDoc: 'x', firstPublishedAt: first }, now)
    expect(v.firstPublishedAt).toBe(first)
    expect(v.publishedAt).toBe(now)
  })
})

describe('UNPUBLISH_VALUES', () => {
  it('clears live state but not firstPublishedAt', () => {
    expect(UNPUBLISH_VALUES).toEqual({ liveDoc: null, publishedAt: null })
  })
})

describe('purgeSite', () => {
  it('purges site tag', async () => {
    const purge = vi.fn().mockResolvedValue(undefined)
    await purgeSite('foo', purge)
    expect(purge).toHaveBeenCalledWith({ tags: ['site-foo'] })
  })
  it('swallows purge errors', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(purgeSite('foo', vi.fn().mockRejectedValue(new Error('x')))).resolves.toBeUndefined()
    expect(err).toHaveBeenCalled()
    err.mockRestore()
  })
})
