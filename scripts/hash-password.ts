import { hashPassword } from '../app/lib/auth'

const password = process.argv[2]
if (!password) {
  console.error('Usage: bun run hash-password <password>')
  process.exit(1)
}

const hash = await hashPassword(password)
console.log(hash)
