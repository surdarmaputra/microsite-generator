import { createFileRoute, Outlet, redirect, useLocation } from '@tanstack/react-router'
import { getAuthFn } from '~/server/fns/auth'
import { ToastProvider } from '~/components/ui/Toast'
import { AdminShell } from '~/components/layout/AdminShell'

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
  const location = useLocation()
  const { username } = Route.useRouteContext()

  const isPreview = location.pathname.startsWith('/admin/preview/')

  if (isPreview) {
    return <Outlet />
  }

  return (
    <ToastProvider>
      <AdminShell username={username}>
        <Outlet />
      </AdminShell>
    </ToastProvider>
  )
}
