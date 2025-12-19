'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { SidebarMenuButton } from '@/components/ui/sidebar'

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()

  return (
    <SidebarMenuButton
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      tooltip="Toggle theme"
    >
      <Sun className="size-4 scale-100 dark:scale-0" />
      <Moon className="absolute size-4 scale-0 dark:scale-100" />
      <span className="group-data-[collapsible=icon]:hidden">Toggle theme</span>
    </SidebarMenuButton>
  )
}
