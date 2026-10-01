import { describe, it, expect, vi, beforeEach } from 'vitest'

const h = vi.hoisted(() => ({
  requireAuth: vi.fn(async () => 'admin'),
  send: vi.fn(async () => ({})),
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
vi.mock('~/server/fns/auth', () => ({ requireAuth: h.requireAuth }))
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({ send: h.send })),
  PutObjectCommand: vi.fn((input: unknown) => ({ input })),
}))

import { uploadImageFn } from '~/server/fns/upload'

const upload = (d: unknown) => (uploadImageFn as unknown as (d: unknown) => Promise<{ url: string }>)(d)
const b64 = (n: number) => Buffer.alloc(n).toString('base64')

beforeEach(() => {
  h.send.mockClear()
  h.requireAuth.mockReset().mockResolvedValue('admin')
  process.env['S3_BUCKET'] = 'bkt'
  process.env['PUBLIC_STORAGE_URL'] = 'https://cdn.test/bkt'
})

describe('uploadImageFn', () => {
  it('rejects unauthenticated', async () => {
    h.requireAuth.mockRejectedValue(new Error('Unauthorized'))
    await expect(upload({ filename: 'a.png', mimeType: 'image/png', base64: b64(1) })).rejects.toThrow('Unauthorized')
    expect(h.send).not.toHaveBeenCalled()
  })
  it('rejects non-image mime', async () => {
    await expect(upload({ filename: 'a.svg', mimeType: 'image/svg+xml', base64: b64(1) })).rejects.toThrow('Unsupported')
    expect(h.send).not.toHaveBeenCalled()
  })
  it('rejects >5MB', async () => {
    await expect(upload({ filename: 'a.png', mimeType: 'image/png', base64: b64(5 * 1024 * 1024 + 1) })).rejects.toThrow('too large')
  })
  it('uploads and returns public url', async () => {
    const { url } = await upload({ filename: 'photo.webp', mimeType: 'image/webp', base64: b64(10) })
    expect(url).toMatch(/^https:\/\/cdn\.test\/bkt\/uploads\/[0-9a-f]{32}\.webp$/)
    expect(h.send).toHaveBeenCalledTimes(1)
  })
})
