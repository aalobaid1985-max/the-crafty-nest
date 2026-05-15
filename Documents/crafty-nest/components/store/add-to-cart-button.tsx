'use client'

import { useState } from 'react'
import { useCartStore, type CartItem } from '@/lib/stores/cart-store'

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
      className="w-full relative overflow-hidden"
      style={{
        height: '44px',
        borderRadius: 'var(--r-sm)',
        background: added ? 'var(--accent2)' : 'var(--ink)',
        color: 'var(--surface)',
        fontSize: '14px',
        border: 'none',
        transition: 'background .2s, transform .1s',
        cursor: 'pointer',
      }}
    >
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={{ transition: 'transform .3s, opacity .25s', transform: added ? 'translateY(-100%)' : 'translateY(0)', opacity: added ? 0 : 1 }}
      >
        أضف للسلة
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={{ transition: 'transform .3s, opacity .25s', transform: added ? 'translateY(0)' : 'translateY(100%)', opacity: added ? 1 : 0 }}
      >
        ✓ تمت الإضافة
      </span>
    </button>
  )
}
