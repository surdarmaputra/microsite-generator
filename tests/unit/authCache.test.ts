import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const h = vi.hoisted(() => ({
  getAuth: vi.fn(),
}))

vi.mock('~/server/fns/auth', () => ({
  getAuthFn: h.getAuth,
}))

import { getCachedAuth, clearAuthCache } from '~/lib/authCache'

beforeEach(() => {
  vi.clearAllMocks()
  clearAuthCache()
  Object.defineProperty(globalThis, 'window', { value: {}, writable: true, configurable: true })
})

afterEach(() => {
  // Restore absence of window for other tests if needed
  clearAuthCache()
})

describe('getCachedAuth', () => {
  it('two calls within 5 minutes hit getAuthFn once', async () => {
    h.getAuth.mockResolvedValue({ username: 'alice' })

    const r1 = await getCachedAuth()
    const r2 = await getCachedAuth()

    expect(r1).toEqual({ username: 'alice' })
    expect(r2).toEqual({ username: 'alice' })
    expect(h.getAuth).toHaveBeenCalledTimes(1)
  })

  it('after clearAuthCache() the next call fetches again', async () => {
    h.getAuth.mockResolvedValue({ username: 'bob' })

    await getCachedAuth()
    clearAuthCache()
    await getCachedAuth()

    expect(h.getAuth).toHaveBeenCalledTimes(2)
  })

  it('does not cache a null username — every call reaches getAuthFn', async () => {
    h.getAuth.mockResolvedValue({ username: null })

    await getCachedAuth()
    await getCachedAuth()

    expect(h.getAuth).toHaveBeenCalledTimes(2)
  })

  it('falls through to getAuthFn on every call when window is undefined (SSR)', async () => {
    h.getAuth.mockResolvedValue({ username: 'server-user' })

    const saved = (globalThis as Record<string, unknown>)['window']
    delete (globalThis as Record<string, unknown>)['window']

    await getCachedAuth()
    await getCachedAuth()

    ;(globalThis as Record<string, unknown>)['window'] = saved
    expect(h.getAuth).toHaveBeenCalledTimes(2)
  })
})
