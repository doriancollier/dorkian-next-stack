'use client'

import Link from 'next/link'
import { Github } from 'lucide-react'
import { SidebarMenuButton } from '@/components/ui/sidebar'

const GITHUB_URL = 'https://github.com/doriancollier/dorkian-next-stack'

export function GitHubLink() {
  return (
    <SidebarMenuButton render={<Link href={GITHUB_URL} target="_blank" />} tooltip="View on GitHub">
      <Github className="size-4" />
      <span className="group-data-[collapsible=icon]:hidden">GitHub</span>
    </SidebarMenuButton>
  )
}
