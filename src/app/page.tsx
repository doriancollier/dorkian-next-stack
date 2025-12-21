import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, FileCode, Book, Layers, Database, Palette } from 'lucide-react'

const techStack = [
  { name: 'Next.js 16', description: 'React framework with App Router' },
  { name: 'React 19', description: 'Latest React with Server Components' },
  { name: 'TypeScript 5.9+', description: 'Full type safety' },
  { name: 'Tailwind CSS v4', description: 'CSS-first configuration' },
  { name: 'Shadcn UI', description: '70+ accessible components' },
  { name: 'Prisma 7', description: 'Type-safe database ORM' },
  { name: 'TanStack Query', description: 'Server state management' },
  { name: 'Zod 4', description: 'Schema validation' },
]

const quickLinks = [
  {
    title: 'Example Page',
    description: 'See forms, components, and patterns in action',
    href: '/example',
    icon: FileCode,
  },
  {
    title: 'Developer Guides',
    description: 'Architecture, patterns, and best practices',
    href: '/developer-guides',
    icon: Book,
    external: true,
  },
  {
    title: 'FSD Architecture',
    description: 'Feature-Sliced Design structure',
    href: '/developer-guides/01-project-structure.md',
    icon: Layers,
    external: true,
  },
  {
    title: 'Database Guide',
    description: 'Prisma patterns and DAL conventions',
    href: '/developer-guides/03-database-prisma.md',
    icon: Database,
    external: true,
  },
  {
    title: 'Design System',
    description: 'Calm Tech design language',
    href: '/docs/DESIGN_SYSTEM.md',
    icon: Palette,
    external: true,
  },
]

export default function HomePage() {
  return (
    <div className="container-default py-8 space-y-8">
      {/* Welcome header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome to Next.js Boilerplate
        </h1>
        <p className="text-muted-foreground text-lg">
          A production-ready starter with modern tooling, type safety, and best practices.
        </p>
      </div>

      {/* Quick start */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>
            Get up and running in minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                1
              </span>
              <div>
                <p className="font-medium">Configure your database</p>
                <p className="text-muted-foreground">
                  Update <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code> with your Neon PostgreSQL connection string
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                2
              </span>
              <div>
                <p className="font-medium">Push the schema</p>
                <p className="text-muted-foreground">
                  Run <code className="text-xs bg-muted px-1 py-0.5 rounded">pnpm prisma:push</code> to create your database tables
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                3
              </span>
              <div>
                <p className="font-medium">Start building</p>
                <p className="text-muted-foreground">
                  Create your first feature in <code className="text-xs bg-muted px-1 py-0.5 rounded">src/layers/features/</code>
                </p>
              </div>
            </div>
          </div>
          <div className="pt-2">
            <Button render={<Link href="/example" />}>
                View Example
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tech stack */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Tech Stack</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="rounded-lg border bg-card p-4 text-card-foreground"
            >
              <p className="font-medium">{tech.name}</p>
              <p className="text-sm text-muted-foreground">{tech.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Resources</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Card key={link.title} className="card-interactive">
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <link.icon className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">{link.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{link.description}</CardDescription>
                  </CardContent>
                </a>
              ) : (
                <Link href={link.href} className="block">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <link.icon className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">{link.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{link.description}</CardDescription>
                  </CardContent>
                </Link>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
