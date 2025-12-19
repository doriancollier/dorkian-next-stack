# Animations Guide

## Motion Library

This project uses [Motion](https://motion.dev/) (formerly Framer Motion) for animations.

## Basic Usage

```typescript
'use client'

import { motion } from 'motion/react'

export function FadeIn({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
```

## Common Patterns

### Fade and Slide

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Scale on Hover

```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click Me
</motion.button>
```

### Staggered List

```typescript
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function StaggeredList({ items }) {
  return (
    <motion.ul variants={container} initial="hidden" animate="show">
      {items.map((item) => (
        <motion.li key={item.id} variants={item}>
          {item.name}
        </motion.li>
      ))}
    </motion.ul>
  )
}
```

### Exit Animations

```typescript
import { AnimatePresence, motion } from 'motion/react'

export function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

## Variants

Define reusable animation states:

```typescript
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

<motion.div {...fadeInUp}>
  Content
</motion.div>
```

## Transitions

```typescript
// Spring physics
transition: { type: 'spring', stiffness: 300, damping: 30 }

// Ease
transition: { ease: 'easeOut', duration: 0.3 }

// Delay
transition: { delay: 0.2 }
```

## Performance Tips

1. Use `will-change` for frequently animated properties
2. Prefer `transform` and `opacity` animations
3. Use `layout` prop sparingly (can cause layout thrashing)
4. Consider `useReducedMotion` for accessibility
