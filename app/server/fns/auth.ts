import { createServerFn } from '@tanstack/start-client-core'
import { useSession } from '@tanstack/start/server'
import { verifyCredentials } from '~/lib/auth'
import { z } from 'zod'

const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

interface SessionData {
  username?: string
}

function sessionConfig() {
  return {
    password: process.env['SESSION_SECRET']!,
    maxAge: SESSION_MAX_AGE,
    name: 'session',
  }
}

export const loginFn = createServerFn({ method: 'POST' })
  .validator((data: { username: string; password: string }) => {
    return z.object({
      username: z.string().min(1).max(100),
      password: z.string().min(1).max(200),
    }).parse(data)
  })
  .handler(async ({ data }) => {
    const valid = await verifyCredentials(data.username, data.password)
    if (!valid) {
      await new Promise(r => setTimeout(r, 200 + Math.random() * 100))
      return { ok: false as const }
    }

    const session = await useSession<SessionData>(sessionConfig())
    await session.update(d => ({ ...d, username: data.username }))
    return { ok: true as const }
  })

export const logoutFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    const session = await useSession<SessionData>(sessionConfig())
    await session.clear()
    return { ok: true }
  })

export const getAuthFn = createServerFn()
  .handler(async () => {
    const session = await useSession<SessionData>(sessionConfig())
    return { username: session.data.username ?? null }
  })

export async function requireAuth(): Promise<string> {
  const session = await useSession<SessionData>(sessionConfig())
  if (!session.data.username) {
    throw new Error('Unauthorized')
  }
  return session.data.username
}
