# Styling & Theming Guide

> For the complete design language specification, see **[docs/DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md)**.

## Design Philosophy: Calm Tech

Our interfaces follow the "Calm Tech" design language — sophisticated, spacious, effortless.

| Principle | Application |
|-----------|-------------|
| **Clarity over decoration** | Every element earns its place |
| **Soft depth over flat** | Subtle shadows create hierarchy |
| **Generous space** | Breathing room makes content shine |
| **No pure black/white** | Use rich, tinted neutrals |

## Tailwind CSS v4

This project uses Tailwind CSS v4 with CSS-first configuration.

### Key Differences from v3

| v3 | v4 |
|----|-----|
| `tailwind.config.js` | `@theme` in CSS |
| `@tailwind base/components/utilities` | `@import 'tailwindcss'` |
| `tailwindcss` PostCSS plugin | `@tailwindcss/postcss` |

### Theme Configuration

Theme is defined in `src/app/globals.css`:

```css
@import 'tailwindcss';

@theme {
  --color-primary: oklch(15% 0 0);
  --color-primary-foreground: oklch(98% 0 0);
  --radius: 0.625rem;
  --font-sans: 'Inter', system-ui, sans-serif;
}

.dark {
  --color-primary: oklch(98% 0 0);
  --color-primary-foreground: oklch(15% 0 0);
}
```

## Dark Mode

Dark mode uses the `class` strategy via next-themes:

```typescript
// Toggle theme
const { theme, setTheme } = useTheme()
setTheme(theme === 'dark' ? 'light' : 'dark')
```

Apply dark mode styles:

```tsx
<div className="bg-white dark:bg-black text-black dark:text-white">
  Content
</div>
```

## cn() Utility

Use `cn()` for conditional classes:

```typescript
import { cn } from '@/lib/utils'

<button
  className={cn(
    'px-4 py-2 rounded',
    isActive && 'bg-primary text-primary-foreground',
    isDisabled && 'opacity-50 cursor-not-allowed'
  )}
>
  Button
</button>
```

## Shadcn Components

### Importing

```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
```

### Customizing

Components accept className for customization:

```tsx
<Button className="w-full">Full Width Button</Button>
<Card className="max-w-md mx-auto">Centered Card</Card>
```

### Variants

Many components have variants:

```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

## Color System

Theme colors use oklch for better color manipulation:

| Variable | Light | Dark |
|----------|-------|------|
| `--background` | White | Near black |
| `--foreground` | Near black | White |
| `--primary` | Dark | Light |
| `--muted` | Light gray | Dark gray |
| `--destructive` | Red | Red |

Usage:

```tsx
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Muted text</p>
  <button className="bg-primary text-primary-foreground">Button</button>
</div>
```

## Responsive Design

Use Tailwind breakpoints:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid adapts to screen size */}
</div>

<p className="text-sm md:text-base lg:text-lg">
  Responsive text
</p>
```

Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px)

## Quick Reference

| Element | Specification |
|---------|---------------|
| **Fonts** | Geist Sans (UI), Geist Mono (code) |
| **Card radius** | 16px (`rounded-xl`) |
| **Button/Input radius** | 10px (`rounded-md`) |
| **Button height** | 40px default |
| **Card padding** | 24px (`p-6`) |

## References

- **[docs/DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md)** - Complete design language
- **[developer-guides/07-animations.md](./07-animations.md)** - Animation patterns
- **[src/app/globals.css](../src/app/globals.css)** - Implemented tokens
