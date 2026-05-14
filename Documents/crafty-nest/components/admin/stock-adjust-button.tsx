'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function StockAdjustButton({ variantId, currentQty }: { variantId: string; currentQty: number }) {
  const [open, setOpen] = useState(false)
  const [qty, setQty] = useState(String(currentQty))
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function save() {
    const val = parseInt(qty, 10)
    if (isNaN(val) || val < 0) return
    setLoading(true)
    await supabase.from('inventory').update({ quantity_on_hand: val } as never).eq('variant_id', variantId)
    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-rose-500 hover:underline">
        تعديل
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={0}
        value={qty}
        onChange={e => setQty(e.target.value)}
        className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:border-rose-300"
      />
      <button onClick={save} disabled={loading} className="text-xs px-2 py-1 bg-rose-500 text-white rounded-lg disabled:opacity-50">
        {loading ? '...' : 'حفظ'}
      </button>
      <button onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">
        ✕
      </button>
    </div>
  )
}
