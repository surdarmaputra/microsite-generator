import { Link, useLocation } from '@tanstack/react-router'
import { LayoutGrid, ChevronsLeft } from 'lucide-react'
import { adminNav } from './nav'

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
}

export function Sidebar({ collapsed, mobileOpen, onToggleCollapse }: SidebarProps) {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <aside
      className={`bg-surface-sidebar fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col transition-[width,transform] duration-200 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
        collapsed ? 'w-16' : 'w-64'
      } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* Brand */}
      <div className="flex h-14 items-center gap-2 px-4">
        <Link
          to="/admin"
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          <span className="rounded-control bg-accent text-paper grid size-7 shrink-0 place-items-center">
            <LayoutGrid size={14} />
          </span>
          {!collapsed && (
            <span className="font-display text-caption tracking-[-0.022em] font-semibold text-ink-primary">
              Microsite
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2" aria-label="Main">
        <ul className="space-y-1">
          {adminNav.map((item) => {
            const active = item.match(pathname)
            const Icon = item.icon
            return (
              <li key={item.label}>
                <Link
                  to={item.href}
                  aria-current={active ? 'page' : undefined}
                  aria-label={item.label}
                  title={collapsed ? item.label : undefined}
                  className={
                    'rounded-control text-caption flex items-center gap-3 px-3 py-2 transition-colors ' +
                    (active
                      ? 'bg-accent/10 text-accent font-semibold'
                      : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary')
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Collapse button — desktop only */}
      <div className="p-2">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="rounded-control text-caption text-ink-secondary hover:bg-surface-hover hover:text-ink-primary hidden w-full items-center gap-3 px-3 py-2 transition-colors lg:flex"
        >
          <ChevronsLeft
            size={18}
            className={'shrink-0 transition-transform' + (collapsed ? ' rotate-180' : '')}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
