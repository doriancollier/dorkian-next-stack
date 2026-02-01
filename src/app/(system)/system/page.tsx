import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Palette,
  Terminal,
  BookOpen,
  Layers,
  Database,
  Sparkles,
  FileCode,
  Zap,
  KeyRound,
  FileWarning,
  AlertTriangle,
  Scale,
  Shield,
  LogIn,
  ShieldCheck,
  LayoutDashboard,
  Cookie,
} from 'lucide-react'

const systemSections = [
  {
    title: 'Design System',
    description:
      '53 UI components, foundations, and patterns following the Calm Tech design language.',
    href: '/system/ui',
    icon: Palette,
    stats: '53 components',
  },
  {
    title: 'Claude Code Harness',
    description:
      'Commands, agents, skills, and automation that make Claude Code work effectively on this project.',
    href: '/system/claude-code',
    icon: Terminal,
    stats: '41 commands',
  },
]

const developerGuides = [
  {
    title: 'Project Structure',
    description: 'FSD architecture, file naming, directory layout',
    href: '/developer-guides/01-project-structure.md',
    icon: Layers,
  },
  {
    title: 'Database & Prisma',
    description: 'Prisma 7, DAL patterns, naming conventions',
    href: '/developer-guides/03-database-prisma.md',
    icon: Database,
  },
  {
    title: 'Forms & Validation',
    description: 'React Hook Form + Zod + Shadcn Form',
    href: '/developer-guides/04-forms-validation.md',
    icon: FileCode,
  },
  {
    title: 'Data Fetching',
    description: 'TanStack Query patterns, mutations',
    href: '/developer-guides/05-data-fetching.md',
    icon: Zap,
  },
  {
    title: 'Authentication',
    description: 'BetterAuth with Email OTP, session management',
    href: '/developer-guides/09-authentication.md',
    icon: KeyRound,
  },
]

const techStack = [
  { name: 'Next.js 16', description: 'React framework with App Router' },
  { name: 'React 19', description: 'Latest React with Server Components' },
  { name: 'TypeScript 5.9+', description: 'Full type safety' },
  { name: 'Tailwind CSS v4', description: 'CSS-first configuration' },
  { name: 'Shadcn UI', description: '70+ accessible components' },
  { name: 'BetterAuth', description: 'Passwordless Email OTP authentication' },
  { name: 'Prisma 7', description: 'Type-safe database ORM' },
  { name: 'TanStack Query', description: 'Server state management' },
  { name: 'Zod 4', description: 'Schema validation' },
]

const standardPages = {
  auth: [
    {
      title: 'Sign In',
      description: 'Email OTP authentication',
      href: '/sign-in',
      file: 'app/(auth)/sign-in/page.tsx',
      icon: LogIn,
    },
    {
      title: 'OTP Verify',
      description: 'One-time password verification',
      href: '/verify',
      file: 'app/(auth)/verify/page.tsx',
      icon: ShieldCheck,
    },
    {
      title: 'Dashboard',
      description: 'Protected authenticated home',
      href: '/dashboard',
      file: 'app/(authenticated)/dashboard/page.tsx',
      icon: LayoutDashboard,
    },
  ],
  error: [
    {
      title: '404 Not Found',
      description: 'Custom page for missing routes',
      href: '/this-page-does-not-exist',
      file: 'app/not-found.tsx',
      icon: FileWarning,
    },
    {
      title: 'Error Pages',
      description: 'Runtime error handling with retry',
      href: null,
      file: 'app/error.tsx, app/global-error.tsx',
      icon: AlertTriangle,
    },
  ],
  legal: [
    {
      title: 'Terms of Service',
      description: 'Legal terms template',
      href: '/terms',
      file: 'app/(public)/terms/page.tsx',
      icon: Scale,
    },
    {
      title: 'Privacy Policy',
      description: 'Privacy policy template',
      href: '/privacy',
      file: 'app/(public)/privacy/page.tsx',
      icon: Shield,
    },
    {
      title: 'Cookie Policy',
      description: 'Cookie usage and consent',
      href: '/cookies',
      file: 'app/(public)/cookies/page.tsx',
      icon: Cookie,
    },
  ],
}

export default function SystemPage() {
  return (
    <div className="container-default py-8 space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="size-4" />
          <span>Template Documentation</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          System Overview
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Everything that makes this template special — design system, Claude
          Code harness, and developer guides. This documentation lives under{' '}
          <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
            /system
          </code>{' '}
          and can be kept or removed as needed.
        </p>
      </div>

      {/* Main Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {systemSections.map((section) => (
          <Card key={section.href} className="card-interactive">
            <Link href={section.href} className="block h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <section.icon className="size-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                  </div>
                  <span className="text-xs font-medium bg-muted px-2 py-1 rounded-full">
                    {section.stats}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {section.description}
                </CardDescription>
                <div className="mt-4 flex items-center text-sm text-primary font-medium">
                  Explore
                  <ArrowRight className="ml-1 size-4" />
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Developer Guides */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Developer Guides
        </h2>
        <p className="text-sm text-muted-foreground">
          Detailed implementation patterns in{' '}
          <code className="bg-muted px-1 py-0.5 rounded text-xs">
            developer-guides/
          </code>
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {developerGuides.map((guide) => (
            <a
              key={guide.href}
              href={guide.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <guide.icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm group-hover:text-primary transition-colors">
                  {guide.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {guide.description}
                </p>
              </div>
            </a>
          ))}
        </div>
        <Button variant="outline" size="sm" render={<a href="/developer-guides" target="_blank" rel="noopener noreferrer" />} nativeButton={false}>
          View All Guides
          <ArrowRight className="ml-2 size-3" />
        </Button>
      </div>

      {/* Tech Stack */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Tech Stack</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="rounded-lg border bg-card p-4 text-card-foreground"
            >
              <p className="font-medium">{tech.name}</p>
              <p className="text-sm text-muted-foreground">
                {tech.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Standard Pages */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Standard Pages
          </h2>
          <p className="text-sm text-muted-foreground">
            Pre-built pages for authentication, error handling, and legal
            compliance.
          </p>
        </div>

        {/* Page categories */}
        {[
          { label: 'Authentication', pages: standardPages.auth },
          { label: 'Error Handling', pages: standardPages.error },
          { label: 'Legal', pages: standardPages.legal },
        ].map((category) => (
          <div key={category.label} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {category.label}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.pages.map((page) => {
                const content = (
                  <>
                    <div className="flex items-start gap-3">
                      <page.icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{page.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {page.description}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 font-mono text-xs text-muted-foreground truncate">
                      {page.file}
                    </p>
                  </>
                )

                return page.href ? (
                  <Link
                    key={page.title}
                    href={page.href}
                    className="group rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={page.title} className="rounded-lg border bg-card p-4">
                    {content}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Customization Note */}
      <Card className="bg-muted/50 border-dashed">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">For Template Users</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            This documentation is part of the template. When building your app:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Keep it</strong> — Reference design patterns and Claude
              Code commands as you build
            </li>
            <li>
              <strong>Remove it</strong> — Delete{' '}
              <code className="bg-muted px-1 py-0.5 rounded text-xs">
                src/app/system/
              </code>{' '}
              when you no longer need it
            </li>
            <li>
              <strong>Customize it</strong> — Add your own system documentation
              under this namespace
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
