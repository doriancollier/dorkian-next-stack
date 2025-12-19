import { LayoutDashboard, FileCode } from 'lucide-react'

export const navItems = [
  {
    label: 'Home',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Example',
    href: '/example',
    icon: FileCode,
  },
] as const
