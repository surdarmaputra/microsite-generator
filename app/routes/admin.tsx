import { createFileRoute, Outlet, redirect, useRouter, useLocation } from '@tanstack/react-router'
import { getAuthFn, logoutFn } from '~/server/fns/auth'
import { ToastProvider } from '~/components/ui/Toast'
import { LogOut, LayoutGrid } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const auth = await getAuthFn()
    if (!auth.username) {
      throw redirect({ to: '/login' })
    }
    return { username: auth.username }
  },
  headers: () => ({
    'Cache-Control': 'private, no-store',
  }),
  component: AdminLayout,
})

function AdminLayout() {
  const router = useRouter()
  const location = useLocation()
  const { username } = Route.useRouteContext()

  const isPreview = location.pathname.startsWith('/admin/preview/')

  const handleLogout = async () => {
    await logoutFn()
    await router.navigate({ to: '/login' })
  }

  if (isPreview) {
    return <Outlet />
  }

  const initials = username.slice(0, 2).toUpperCase()

  return (
    <ToastProvider>
      <div className="bg-surface-page min-h-screen">
        <header className="bg-surface-page border-hairline sticky top-0 z-20 flex h-14 items-center gap-3 border-b px-6">
          <a
            href="/admin"
            className="flex items-center gap-2 transition-opacity hover:opacity-70"
          >
            <span className="rounded-control bg-accent text-paper grid size-7 place-items-center">
              <LayoutGrid size={14} />
            </span>
            <span className="font-display text-caption tracking-[-0.022em] font-semibold text-ink-primary">
              Microsite
            </span>
          </a>

          <div className="flex-1" />

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                aria-label="Account menu"
                className="rounded-control hover:bg-surface-hover flex items-center gap-2 px-2 py-1.5 transition-colors"
              >
                <span className="bg-surface-hover text-micro text-ink-primary grid size-7 place-items-center rounded-full font-semibold border border-hairline">
                  {initials}
                </span>
                <span className="text-caption text-ink-secondary hidden sm:block">{username}</span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={4}
                className="rounded-card border-hairline bg-surface-card shadow-card z-50 min-w-36 border p-1"
              >
                <DropdownMenu.Item
                  onSelect={handleLogout}
                  className="rounded-control text-caption text-danger hover:bg-danger/10 flex cursor-default items-center gap-2 px-3 py-2 transition-colors outline-none"
                >
                  <LogOut size={14} /> Sign out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  )
}
