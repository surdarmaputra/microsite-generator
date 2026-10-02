import type { LucideIcon } from 'lucide-react'
import { Globe } from 'lucide-react'

export interface NavItem {
  label: string
  href: '/admin'
  icon: LucideIcon
  match: (pathname: string) => boolean
}

export const adminNav: NavItem[] = [
  {
    label: 'Sites',
    href: '/admin',
    icon: Globe,
    match: (p) => p === '/admin' || p.startsWith('/admin/editor/'),
  },
]
