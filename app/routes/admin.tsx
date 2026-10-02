import { createFileRoute, Outlet, redirect, useLocation } from '@tanstack/react-router'
import { getAuthFn } from '~/server/fns/auth'
import { ToastProvider } from '~/components/ui/Toast'
import { AdminShell } from '~/components/layout/AdminShell'
import { NewSiteDialogProvider } from '~/components/admin/NewSiteDialog'

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
      <NewSiteDialogProvider>
        <AdminShell username={username}>
          <Outlet />
        </AdminShell>
      </NewSiteDialogProvider>
    </ToastProvider>
  )
}
