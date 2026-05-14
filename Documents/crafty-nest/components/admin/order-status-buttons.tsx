'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const STATUS_LABEL: Record<string, string> = {
  pending: 'قيد الانتظار', confirmed: 'مؤكد', packed: 'جاهز',
  shipped: 'قيد التوصيل', delivered: 'تم التسليم',
}

interface Props {
  orderId: string
  currentStatus: string
  statusFlow: string[]
}

export function OrderStatusButtons({ orderId, currentStatus, statusFlow }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const currentIndex = statusFlow.indexOf(currentStatus)

  async function advance() {
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) return
    const nextStatus = statusFlow[currentIndex + 1]
    setLoading(true)
    await supabase.from('orders').update({ status: nextStatus } as never).eq('id', orderId)
    setLoading(false)
    router.refresh()
  }

  async function cancel() {
    setLoading(true)
    await supabase.from('orders').update({ status: 'cancelled' } as never).eq('id', orderId)
    setLoading(false)
    router.refresh()
  }

  const isTerminal = currentStatus === 'delivered' || currentStatus === 'cancelled' || currentStatus === 'refunded'

  return (
    <div className="flex flex-wrap gap-2">
      {/* Progress dots */}
      <div className="w-full flex items-center gap-1 mb-3">
        {statusFlow.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${i <= currentIndex ? 'bg-rose-500' : 'bg-gray-200'}`} />
            <span className={`text-xs ${i <= currentIndex ? 'text-rose-500 font-medium' : 'text-gray-400'}`}>
              {STATUS_LABEL[s]}
            </span>
            {i < statusFlow.length - 1 && <div className={`w-6 h-px ${i < currentIndex ? 'bg-rose-300' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {!isTerminal && currentIndex < statusFlow.length - 1 && (
        <button
          onClick={advance}
          disabled={loading}
          className="px-4 py-2 bg-rose-500 text-white text-sm font-medium rounded-xl hover:bg-rose-600 disabled:opacity-50 transition-colors"
        >
          {loading ? '...' : `تأكيد: ${STATUS_LABEL[statusFlow[currentIndex + 1]]}`}
        </button>
      )}

      {!isTerminal && currentStatus !== 'delivered' && (
        <button
          onClick={cancel}
          disabled={loading}
          className="px-4 py-2 bg-white border border-red-200 text-red-500 text-sm font-medium rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          إلغاء الطلب
        </button>
      )}

      {isTerminal && (
        <p className="text-sm text-gray-400">
          {currentStatus === 'delivered' ? 'تم تسليم الطلب بنجاح ✓' : 'الطلب مُلغى'}
        </p>
      )}
    </div>
  )
}
