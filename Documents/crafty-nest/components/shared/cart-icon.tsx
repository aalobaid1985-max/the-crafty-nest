'use client'

import Link from 'next/link'
import { useCartStore } from '@/lib/stores/cart-store'

export function CartIcon() {
  const totalItems = useCartStore(s => s.totalItems())

  return (
    <Link
      href="/cart"
      className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 transition-opacity hover:opacity-90"
      style={{
        border: '1px solid var(--ink)',
        background: 'var(--ink)',
        color: 'var(--surface)',
        fontSize: '13px',
      }}
    >
      السلة
      <span
        className="inline-flex items-center justify-center rounded-full min-w-[22px] h-[22px] px-1.5 text-[11.5px] font-mono tabular-nums transition-transform"
        style={{
          background: totalItems > 0 ? 'var(--accent)' : 'color-mix(in oklab, var(--surface) 20%, transparent)',
          color: 'var(--surface)',
        }}
      >
        {totalItems}
      </span>
    </Link>
  )
}
