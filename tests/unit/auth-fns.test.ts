import { describe, it, expect, vi, beforeEach } from 'vitest'

const h = vi.hoisted(() => ({
  session: { data: {} as { username?: string }, update: vi.fn(), clear: vi.fn() },
  verify: vi.fn(),
}))

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
vi.mock('@tanstack/start/server', () => ({ useSession: async () => h.session }))
vi.mock('~/lib/auth', () => ({ verifyCredentials: h.verify }))

import { loginFn, logoutFn, getAuthFn, requireAuth } from '~/server/fns/auth'

const run = (fn: unknown, input?: unknown) => (fn as (i?: unknown) => Promise<any>)(input)

beforeEach(() => {
  h.session.data = {}
  h.session.update.mockReset()
  h.session.clear.mockReset()
  h.verify.mockReset()
})

describe('loginFn', () => {
  it('sets session on valid creds', async () => {
    h.verify.mockResolvedValue(true)
    expect(await run(loginFn, { username: 'u', password: 'p' })).toEqual({ ok: true })
    expect(h.session.update).toHaveBeenCalled()
    const updater = h.session.update.mock.calls[0]![0] as (d: object) => object
    expect(updater({})).toEqual({ username: 'u' })
  })
  it('returns ok:false and no session on bad creds', async () => {
    h.verify.mockResolvedValue(false)
    expect(await run(loginFn, { username: 'u', password: 'bad' })).toEqual({ ok: false })
    expect(h.session.update).not.toHaveBeenCalled()
  })
  it('rejects empty input', async () => {
    await expect(run(loginFn, { username: '', password: '' })).rejects.toThrow()
  })
})

describe('logoutFn / getAuthFn / requireAuth', () => {
  it('logout clears session', async () => {
    expect(await run(logoutFn)).toEqual({ ok: true })
    expect(h.session.clear).toHaveBeenCalled()
  })
  it('getAuth returns username or null', async () => {
    expect(await run(getAuthFn)).toEqual({ username: null })
    h.session.data = { username: 'u' }
    expect(await run(getAuthFn)).toEqual({ username: 'u' })
  })
  it('requireAuth throws without session, returns username with', async () => {
    await expect(requireAuth()).rejects.toThrow('Unauthorized')
    h.session.data = { username: 'u' }
    expect(await requireAuth()).toBe('u')
  })
})
