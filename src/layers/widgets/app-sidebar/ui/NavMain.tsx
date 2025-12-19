'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'
import { navItems } from '../lib/nav-items'

export function NavMain() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const prevPathnameRef = useRef(pathname)

  // Auto-close mobile drawer on navigation (only when pathname actually changes)
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      setOpenMobile(false)
      prevPathnameRef.current = pathname
    }
  }, [pathname, setOpenMobile])

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
