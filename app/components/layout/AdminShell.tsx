import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useRouter, useLocation, useRouterState } from '@tanstack/react-router'
import { logoutFn } from '~/server/fns/auth'
import { clearAuthCache } from '~/lib/authCache'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { NavigationProgress } from './NavigationProgress'

interface AdminShellProps {
  username: string
  children: ReactNode
}

export function AdminShell({ username, children }: AdminShellProps) {
  const router = useRouter()
  const location = useLocation()
  const pathname = location.pathname

  // Use resolved location for layout decisions so the sidebar collapse
  // and main padding only change after the new route has loaded.
  const resolvedPathname = useRouterState({
    select: (s) => (s.resolvedLocation ?? s.location).pathname,
  })
  const isEditorRoute = resolvedPathname.startsWith('/admin/editor/')

  // Non-editor collapse — persisted in localStorage; initial state false (never read during render)
  const [collapsed, setCollapsed] = useState(false)
  // Editor collapse — non-persisted, always starts collapsed when entering an editor route
  const [editorCollapsed, setEditorCollapsed] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Read localStorage after mount to avoid SSR hydration mismatch
  useEffect(() => {
    const stored = localStorage.getItem('admin-sidebar')
    if (stored === 'collapsed') setCollapsed(true)
    else if (stored === 'expanded') setCollapsed(false)
  }, [])

  // Reset editorCollapsed to true every time an editor route is entered
  const prevIsEditorRef = useRef(isEditorRoute)
  useEffect(() => {
    if (isEditorRoute && !prevIsEditorRef.current) {
      setEditorCollapsed(true)
    }
    prevIsEditorRef.current = isEditorRoute
  }, [isEditorRoute])

  // Close mobile sidebar on pathname change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close mobile sidebar on Esc
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const effectiveCollapsed = isEditorRoute ? editorCollapsed : collapsed

  function toggleCollapse() {
    if (isEditorRoute) {
      setEditorCollapsed((c) => !c)
    } else {
      setCollapsed((c) => {
        const next = !c
        localStorage.setItem('admin-sidebar', next ? 'collapsed' : 'expanded')
        return next
      })
    }
  }

  const handleLogout = async () => {
    await logoutFn()
    clearAuthCache()
    await router.navigate({ to: '/login' })
  }

  return (
    <>
      <NavigationProgress />
      <div className="flex min-h-screen">
        <Sidebar
          collapsed={effectiveCollapsed}
          mobileOpen={mobileOpen}
          onToggleCollapse={toggleCollapse}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="bg-midnight-ink/50 fixed inset-0 z-30 lg:hidden"
            aria-hidden="true"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            username={username}
            onMobileMenuOpen={() => setMobileOpen(true)}
            onLogout={handleLogout}
          />
          <main className={isEditorRoute ? '' : 'p-6'}>{children}</main>
        </div>
      </div>
    </>
  )
}
