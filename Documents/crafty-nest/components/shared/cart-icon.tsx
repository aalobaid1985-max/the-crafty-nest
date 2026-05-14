'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart-store'

export function CartIcon() {
  const totalItems = useCartStore(s => s.totalItems())

  return (
    <Link href="/cart" className="relative text-gray-600 hover:text-gray-900">
      <ShoppingBag className="w-5 h-5" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -left-2 bg-rose-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {totalItems}
        </span>
      )}
    </Link>
  )
}
