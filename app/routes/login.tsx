import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { loginFn } from '~/server/fns/auth'
import { Button } from '~/components/ui/Button'
import { Input } from '~/components/ui/Input'

export const Route = createFileRoute('/login')({
  head: () => ({
    meta: [{ title: 'Sign in · Microsite Generator' }],
  }),
  headers: () => ({
    'Cache-Control': 'no-store',
  }),
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await loginFn({ data: { username, password } })
      if (result.ok) {
        await router.navigate({ to: '/admin' })
      } else {
        setError('Invalid credentials')
      }
    } catch {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface-sidebar flex min-h-screen flex-col items-center justify-center p-6">
      <main className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="rounded-control bg-accent text-paper grid size-8 place-items-center">
            <span className="text-caption font-semibold">M</span>
          </span>
          <span className="font-display text-subheading tracking-[-0.022em] font-semibold text-ink-primary">
            Microsite
          </span>
        </div>

        <div className="rounded-card border-hairline bg-surface-card shadow-raised border p-6">
          <h1 className="font-display text-title tracking-[-0.022em] font-semibold text-ink-primary">
            Sign in
          </h1>
          <p className="text-caption text-ink-secondary mt-1">Welcome back. Enter your details.</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Input
              label="Username"
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <Input
              label="Password"
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-caption text-danger">{error}</p>}
            <Button type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
