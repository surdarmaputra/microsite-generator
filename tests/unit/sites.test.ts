import { describe, it, expect, vi, beforeEach } from 'vitest'

const h = vi.hoisted(() => {
  const results: unknown[] = []
  const calls: Array<[string, unknown[]]> = []
  function chain(): any {
    const p: any = new Proxy(function () {}, {
      get(_t, prop: string) {
        if (prop === 'then') {
          const r = results.shift()
          return (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) =>
            Promise.resolve(r).then(res, rej)
        }
        return (...args: unknown[]) => {
          calls.push([prop, args])
          return p
        }
      },
    })
    return p
  }
  return {
    results,
    calls,
    chain,
    requireAuth: vi.fn(async () => 'admin-user'),
    purgeCache: vi.fn(async () => {}),
  }
})

vi.mock('@tanstack/start-client-core', () => ({
  createServerFn: () => {
    let validate = (d: unknown) => d
    const b: any = {
      validator: (v: (d: unknown) => unknown) => ((validate = v), b),
      handler: (fn: (a: { data: unknown }) => unknown) => async (input?: unknown) =>
        fn({ data: validate(input) }),
    }
    return b
  },
}))
vi.mock('~/server/db', () => ({
  db: {
    select: () => (h.calls.push(['select', []]), h.chain()),
    insert: () => (h.calls.push(['insert', []]), h.chain()),
    update: () => (h.calls.push(['update', []]), h.chain()),
    delete: () => (h.calls.push(['delete', []]), h.chain()),
  },
}))
vi.mock('~/server/fns/auth', () => ({ requireAuth: h.requireAuth }))
vi.mock('@netlify/functions', () => ({ purgeCache: h.purgeCache }))

import {
  listSitesFn, getSiteFn, createSiteFn, saveDraftFn, publishFn,
  unpublishFn, deleteSiteFn, duplicateSiteFn, getLiveDocFn,
} from '~/server/fns/sites'

const ID = '11111111-1111-4111-8111-111111111111'
const call = (fn: unknown, input?: unknown) => (fn as (i?: unknown) => Promise<any>)(input)
const callNames = () => h.calls.map(c => c[0])

beforeEach(() => {
  h.results.length = 0
  h.calls.length = 0
  h.requireAuth.mockClear().mockResolvedValue('admin-user')
  h.purgeCache.mockClear().mockResolvedValue(undefined)
})

describe('auth gate', () => {
  it.each([
    ['listSitesFn', listSitesFn, undefined],
    ['getSiteFn', getSiteFn, { id: ID }],
    ['createSiteFn', createSiteFn, { name: 'a', slug: 'a' }],
    ['saveDraftFn', saveDraftFn, { id: ID, doc: { meta: { title: 't', description: '' }, blocks: [] }, version: 1 }],
    ['publishFn', publishFn, { id: ID }],
    ['unpublishFn', unpublishFn, { id: ID }],
    ['deleteSiteFn', deleteSiteFn, { id: ID }],
    ['duplicateSiteFn', duplicateSiteFn, { id: ID, newName: 'n', newSlug: 's' }],
  ])('%s rejects when unauthenticated', async (_n, fn, input) => {
    h.requireAuth.mockRejectedValue(new Error('Unauthorized'))
    await expect(call(fn, input)).rejects.toThrow('Unauthorized')
    expect(callNames()).not.toContain('insert')
    expect(callNames()).not.toContain('update')
    expect(callNames()).not.toContain('delete')
    expect(h.purgeCache).not.toHaveBeenCalled()
  })
})

describe('listSitesFn / getSiteFn', () => {
  it('lists sites', async () => {
    h.results.push([{ id: 'x' }])
    expect(await call(listSitesFn)).toEqual([{ id: 'x' }])
  })
  it('gets site', async () => {
    h.results.push([{ id: ID }])
    expect(await call(getSiteFn, { id: ID })).toEqual({ id: ID })
  })
  it('throws when site missing', async () => {
    h.results.push([])
    await expect(call(getSiteFn, { id: ID })).rejects.toThrow('Not found')
  })
})

describe('createSiteFn', () => {
  it.each(['admin', 'api', 'assets'])('rejects reserved slug %s', async slug => {
    await expect(call(createSiteFn, { name: 'n', slug })).rejects.toThrow('reserved')
    expect(callNames()).not.toContain('insert')
  })
  it('rejects invalid slug chars', async () => {
    await expect(call(createSiteFn, { name: 'n', slug: 'Bad Slug' })).rejects.toThrow()
  })
  it('inserts with name as meta title', async () => {
    h.results.push([{ id: ID, slug: 'ok' }])
    const site = await call(createSiteFn, { name: 'My Site', slug: 'ok' })
    expect(site).toEqual({ id: ID, slug: 'ok' })
    const values = h.calls.find(c => c[0] === 'values')![1][0] as any
    expect(values.draftDoc.meta.title).toBe('My Site')
    expect(values.draftVersion).toBe(1)
  })
})

describe('saveDraftFn', () => {
  const doc = {
    meta: { title: 't', description: '' },
    blocks: [
      { id: 'a', type: 'card', html: '<p>hi</p><script>alert(1)</script>' },
      { id: 'b', type: 'cta', props: { label: 'x', href: 'javascript:alert(1)', newTab: false } },
      { id: 'c', type: 'hero', props: { variant: 'banner' }, html: '<p onclick="x()">h</p>' },
      { id: 'd', type: 'trimmed', html: '<p>t</p>' },
    ],
  }
  it('sanitizes html + cta href and bumps version', async () => {
    h.results.push([{ version: 4 }])
    expect(await call(saveDraftFn, { id: ID, doc, version: 3 })).toEqual({ version: 4 })
    const set = h.calls.find(c => c[0] === 'set')![1][0] as any
    expect(set.draftVersion).toBe(4)
    const blocks = set.draftDoc.blocks
    expect(blocks[0].html).not.toContain('script')
    expect(blocks[1].props.href).not.toMatch(/^javascript:/i)
    expect(blocks[2].html).not.toContain('onclick')
  })
  it('throws 409 on version mismatch', async () => {
    h.results.push([])
    await expect(call(saveDraftFn, { id: ID, doc, version: 1 })).rejects.toThrow('409')
  })
  it('rejects invalid doc', async () => {
    await expect(call(saveDraftFn, { id: ID, doc: { nope: 1 }, version: 1 })).rejects.toThrow()
    expect(callNames()).not.toContain('update')
  })
})

describe('publishFn', () => {
  it('copies draft to live, sets firstPublishedAt, purges tag', async () => {
    h.results.push([{ slug: 'foo', draftDoc: { d: 1 }, firstPublishedAt: null }], undefined)
    expect(await call(publishFn, { id: ID })).toEqual({ ok: true })
    const set = h.calls.find(c => c[0] === 'set')![1][0] as any
    expect(set.liveDoc).toEqual({ d: 1 })
    expect(set.firstPublishedAt).toBeInstanceOf(Date)
    expect(h.purgeCache).toHaveBeenCalledWith({ tags: ['site-foo'] })
  })
  it('keeps original firstPublishedAt', async () => {
    const first = new Date('2025-01-01')
    h.results.push([{ slug: 'foo', draftDoc: {}, firstPublishedAt: first }], undefined)
    await call(publishFn, { id: ID })
    const set = h.calls.find(c => c[0] === 'set')![1][0] as any
    expect(set.firstPublishedAt).toBe(first)
  })
  it('throws when missing, no purge', async () => {
    h.results.push([])
    await expect(call(publishFn, { id: ID })).rejects.toThrow('Not found')
    expect(h.purgeCache).not.toHaveBeenCalled()
  })
  it('still succeeds when purge fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    h.purgeCache.mockRejectedValue(new Error('boom'))
    h.results.push([{ slug: 'foo', draftDoc: {}, firstPublishedAt: null }], undefined)
    expect(await call(publishFn, { id: ID })).toEqual({ ok: true })
  })
})

describe('unpublishFn', () => {
  it('clears live doc and purges', async () => {
    h.results.push([{ slug: 'foo' }], undefined)
    await call(unpublishFn, { id: ID })
    const set = h.calls.find(c => c[0] === 'set')![1][0] as any
    expect(set).toEqual({ liveDoc: null, publishedAt: null })
    expect(h.purgeCache).toHaveBeenCalledWith({ tags: ['site-foo'] })
  })
  it('throws when missing', async () => {
    h.results.push([])
    await expect(call(unpublishFn, { id: ID })).rejects.toThrow('Not found')
  })
})

describe('deleteSiteFn', () => {
  it('deletes and purges', async () => {
    h.results.push([{ slug: 'foo' }], undefined)
    await call(deleteSiteFn, { id: ID })
    expect(callNames()).toContain('delete')
    expect(h.purgeCache).toHaveBeenCalledWith({ tags: ['site-foo'] })
  })
  it('throws when missing, no delete', async () => {
    h.results.push([])
    await expect(call(deleteSiteFn, { id: ID })).rejects.toThrow('Not found')
    expect(callNames()).not.toContain('delete')
  })
})

describe('duplicateSiteFn', () => {
  it('rejects reserved slug', async () => {
    await expect(call(duplicateSiteFn, { id: ID, newName: 'n', newSlug: 'admin' })).rejects.toThrow('Reserved slug')
  })
  it('throws when source missing', async () => {
    h.results.push([])
    await expect(call(duplicateSiteFn, { id: ID, newName: 'n', newSlug: 'copy' })).rejects.toThrow('Not found')
  })
  it('copies draft only, resets version', async () => {
    h.results.push([{ draftDoc: { d: 1 }, liveDoc: { l: 1 } }], [{ id: 'new' }])
    expect(await call(duplicateSiteFn, { id: ID, newName: 'n', newSlug: 'copy' })).toEqual({ id: 'new' })
    const values = h.calls.find(c => c[0] === 'values')![1][0] as any
    expect(values).toEqual({ name: 'n', slug: 'copy', draftDoc: { d: 1 }, draftVersion: 1 })
  })
})

describe('getLiveDocFn', () => {
  it('returns site', async () => {
    h.results.push([{ slug: 'foo' }])
    expect(await call(getLiveDocFn, { slug: 'foo' })).toEqual({ slug: 'foo' })
  })
  it('returns null when missing', async () => {
    h.results.push([])
    expect(await call(getLiveDocFn, { slug: 'nope' })).toBeNull()
  })
})
