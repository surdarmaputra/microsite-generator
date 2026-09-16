import { createFileRoute, Outlet, redirect, useRouter } from '@tanstack/react-router'
import { getAuthFn, logoutFn } from '~/server/fns/auth'
import { ToastProvider } from '~/components/ui/Toast'

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
  const { username } = Route.useRouteContext()

  const handleLogout = async () => {
    await logoutFn()
    await router.navigate({ to: '/login' })
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50" style={{ maxWidth: 'none' }}>
        <header className="border-b border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Microsite Generator</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{username}</span>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  )
}
