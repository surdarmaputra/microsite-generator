import type { LucideIcon } from 'lucide-react'
import { Globe, Palette } from 'lucide-react'

export interface NavItem {
  label: string
  href: '/admin' | '/admin/themes'
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
  {
    label: 'Themes',
    href: '/admin/themes',
    icon: Palette,
    match: (p) => p.startsWith('/admin/themes'),
  },
]
