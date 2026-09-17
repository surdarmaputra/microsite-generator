import bcrypt from 'bcryptjs'
import { timingSafeEqual } from 'node:crypto'

export interface AdminUser {
  username: string
  hash: string
}

function parseAdminUsers(): AdminUser[] {
  const raw = process.env['ADMIN_USERS'] ?? ''
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(pair => {
      const idx = pair.indexOf(':')
      if (idx === -1) throw new Error(`ADMIN_USERS: malformed entry "${pair}"`)
      return { username: pair.slice(0, idx), hash: pair.slice(idx + 1) }
    })
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const users = parseAdminUsers()
  const user = users.find(u => {
    const a = Buffer.from(u.username)
    const b = Buffer.from(username)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  })
  if (!user) {
    await bcrypt.compare(password, '$2b$12$invalid.hash.to.prevent.timing.leak.xxxxx')
    return false
  }
  return bcrypt.compare(password, user.hash)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}
