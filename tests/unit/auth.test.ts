import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { hashPassword, verifyCredentials } from '~/lib/auth'

describe('hashPassword', () => {
  it('returns a bcrypt hash starting with $2b$', async () => {
    const hash = await hashPassword('somepassword')
    expect(hash).toMatch(/^\$2[ab]\$/)
  })

  it('returns a different hash on each call (salt is random)', async () => {
    const h1 = await hashPassword('samepassword')
    const h2 = await hashPassword('samepassword')
    expect(h1).not.toBe(h2)
  })
})

describe('verifyCredentials', () => {
  const correctPassword = 'correct-password-123'
  let adminHash: string

  beforeAll(async () => {
    adminHash = await hashPassword(correctPassword)
    vi.stubEnv('ADMIN_USERS', `testuser:${adminHash}`)
  })

  afterAll(() => {
    vi.unstubAllEnvs()
  })

  it('returns true for valid username and correct password', async () => {
    const result = await verifyCredentials('testuser', correctPassword)
    expect(result).toBe(true)
  })

  it('returns false for valid username and wrong password', async () => {
    const result = await verifyCredentials('testuser', 'wrong-password')
    expect(result).toBe(false)
  })

  it('returns false for unknown username without throwing', async () => {
    await expect(verifyCredentials('nobody', correctPassword)).resolves.toBe(false)
  })

  it('returns false for empty credentials', async () => {
    const result = await verifyCredentials('', '')
    expect(result).toBe(false)
  })
})

describe('verifyCredentials — multiple admin users', () => {
  let hash1: string
  let hash2: string

  beforeAll(async () => {
    hash1 = await hashPassword('pass1')
    hash2 = await hashPassword('pass2')
    vi.stubEnv('ADMIN_USERS', `alice:${hash1},bob:${hash2}`)
  })

  afterAll(() => {
    vi.unstubAllEnvs()
  })

  it('authenticates first user', async () => {
    expect(await verifyCredentials('alice', 'pass1')).toBe(true)
  })

  it('authenticates second user', async () => {
    expect(await verifyCredentials('bob', 'pass2')).toBe(true)
  })

  it('rejects first user with second password', async () => {
    expect(await verifyCredentials('alice', 'pass2')).toBe(false)
  })
})
