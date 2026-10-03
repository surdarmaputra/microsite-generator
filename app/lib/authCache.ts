import { getAuthFn } from '~/server/fns/auth'

interface CacheEntry {
  value: { username: string | null }
  expiresAt: number
}

const TTL = 5 * 60 * 1000 // 5 minutes
let cache: CacheEntry | null = null

export async function getCachedAuth(): Promise<{ username: string | null }> {
  if (typeof window === 'undefined') {
    // Server: always call through; no persistent state between requests
    return getAuthFn()
  }

  const now = Date.now()
  if (cache !== null && cache.expiresAt > now) {
    return cache.value
  }

  const result = await getAuthFn()
  if (result.username !== null) {
    cache = { value: result, expiresAt: now + TTL }
  }
  return result
}

export function clearAuthCache(): void {
  cache = null
}
