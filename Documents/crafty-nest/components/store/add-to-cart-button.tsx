'use client'

import { useState } from 'react'
import { useCartStore, type CartItem } from '@/lib/stores/cart-store'
import { ShoppingBag, Check } from 'lucide-react'

interface Props {
  item: Omit<CartItem, 'quantity'>
}

export function AddToCartButton({ item }: Props) {
  const addItem = useCartStore(s => s.addItem)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem(item)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button
      onClick={handleAdd}
      className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base transition-all ${
        added
          ? 'bg-green-500 text-white'
          : 'bg-rose-500 hover:bg-rose-600 text-white'
      }`}
    >
      {added ? (
        <span className="flex items-center gap-2"><Check className="w-5 h-5" /><span>تمت الإضافة للسلة</span></span>
      ) : (
        <span className="flex items-center gap-2"><ShoppingBag className="w-5 h-5" /><span>أضف للسلة</span></span>
      )}
    </button>
  )
}
