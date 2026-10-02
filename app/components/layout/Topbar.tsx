import { ChevronDown, LogOut, Menu } from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface TopbarProps {
  username: string
  onMobileMenuOpen: () => void
  onLogout: () => void
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const isEditor = pathname.startsWith('/admin/editor/')

  return (
    <nav aria-label="Breadcrumb">
      <ol className="text-caption flex items-center gap-1">
        {isEditor ? (
          <>
            <li>
              <Link to="/admin" className="text-ink-secondary hover:text-ink-primary transition-colors">
                Sites
              </Link>
            </li>
            <li className="flex items-center gap-1">
              <span className="text-ink-secondary">/</span>
              <span className="text-ink-primary font-medium" aria-current="page">
                Editor
              </span>
            </li>
          </>
        ) : (
          <li>
            <span className="text-ink-primary font-medium" aria-current="page">
              Sites
            </span>
          </li>
        )}
      </ol>
    </nav>
  )
}

export function Topbar({ username, onMobileMenuOpen, onLogout }: TopbarProps) {
  const location = useLocation()
  const pathname = location.pathname
  const initials = username.slice(0, 2).toUpperCase()

  return (
    <header className="bg-surface-page border-hairline sticky top-0 z-20 flex h-14 items-center gap-3 border-b px-4">
      <button
        type="button"
        onClick={onMobileMenuOpen}
        aria-label="Open navigation"
        className="rounded-control text-ink-secondary hover:bg-surface-hover hover:text-ink-primary grid size-9 place-items-center transition-colors lg:hidden"
      >
        <Menu size={18} />
      </button>

      <div className="min-w-0 flex-1">
        <Breadcrumb pathname={pathname} />
      </div>

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
            <ChevronDown size={14} className="text-ink-secondary" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={4}
            className="rounded-card border-hairline bg-surface-card shadow-card z-50 min-w-36 border p-1"
          >
            <DropdownMenu.Item
              onSelect={onLogout}
              className="rounded-control text-caption text-danger hover:bg-danger/10 flex cursor-default items-center gap-2 px-3 py-2 transition-colors outline-none"
            >
              <LogOut size={14} /> Sign out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </header>
  )
}
