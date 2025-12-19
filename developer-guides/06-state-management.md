# State Management Guide

## When to Use What

| State Type | Tool | Example |
|------------|------|---------|
| Server state | TanStack Query | User data from API |
| Complex client state | Zustand | Shopping cart, multi-step form |
| Simple UI state | React useState | Modal open/close |
| URL state | Next.js router | Filters, pagination |

## Zustand Store

### Creating a Store

```typescript
// src/stores/cart-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => set((state) => {
        const existing = state.items.find((i) => i.id === item.id)
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          }
        }
        return { items: [...state.items, { ...item, quantity: 1 }] }
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),

      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((i) =>
          i.id === id ? { ...i, quantity } : i
        ),
      })),

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    }),
    {
      name: 'cart-storage',
    }
  )
)
```

### Using the Store

```typescript
'use client'

import { useCartStore } from '@/stores/cart-store'

export function CartSummary() {
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total)
  const clearCart = useCartStore((state) => state.clearCart)

  return (
    <div>
      <p>{items.length} items</p>
      <p>Total: ${total()}</p>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  )
}
```

### Selector Pattern

Use selectors to prevent unnecessary re-renders:

```typescript
// Good - only re-renders when itemCount changes
const itemCount = useCartStore((state) => state.items.length)

// Bad - re-renders on any state change
const { items } = useCartStore()
```

## Combining with TanStack Query

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { useCartStore } from '@/stores/cart-store'

export function ProductList() {
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })
  const addItem = useCartStore((state) => state.addItem)

  return (
    <ul>
      {products?.map((product) => (
        <li key={product.id}>
          {product.name}
          <button onClick={() => addItem(product)}>Add to Cart</button>
        </li>
      ))}
    </ul>
  )
}
```

## Persistence

Zustand's `persist` middleware automatically saves state to localStorage:

```typescript
persist(
  (set) => ({ /* store */ }),
  {
    name: 'storage-key',          // localStorage key
    partialize: (state) => ({     // Optional: only persist some fields
      items: state.items,
    }),
  }
)
```
