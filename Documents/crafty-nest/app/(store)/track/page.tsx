'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const STATUS_STEPS = ['pending', 'confirmed', 'packed', 'shipped', 'delivered']
const STATUS_LABEL: Record<string, string> = {
  pending:   'قيد الانتظار',
  confirmed: 'تم التأكيد',
  packed:    'جاهز للتوصيل',
  shipped:   'قيد التوصيل',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
  refunded:  'مسترجع',
}
const STATUS_DESC: Record<string, string> = {
  pending:   'تم استلام طلبك وسيتم مراجعته قريباً',
  confirmed: 'تم تأكيد طلبك وجاري تجهيزه',
  packed:    'طلبك جاهز وفي انتظار مندوب التوصيل',
  shipped:   'المندوب في طريقه إليك',
  delivered: 'تم تسليم طلبك بنجاح',
  cancelled: 'تم إلغاء الطلب',
  refunded:  'تم استرجاع المبلغ',
}

interface OrderData {
  order_number: string
  status: string
  payment_method: string
  payment_status: string
  total_kwd: number
  delivery_slot: string | null
  created_at: string
  address_snapshot: Record<string, string>
}

export default function TrackPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<OrderData | null>(null)
  const [notFound, setNotFound] = useState(false)

  const supabase = createClient()

  async function search() {
    const cleaned = query.trim().toUpperCase()
    if (!cleaned) return
    setLoading(true)
    setNotFound(false)
    setOrder(null)

    const { data } = await supabase
      .from('orders')
      .select('order_number, status, payment_method, payment_status, total_kwd, delivery_slot, created_at, address_snapshot')
      .eq('order_number', cleaned)
      .single()

    setLoading(false)
    if (!data) {
      setNotFound(true)
      return
    }
    setOrder(data as OrderData)
  }

  const stepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1
  const isTerminal = order?.status === 'cancelled' || order?.status === 'refunded'

  return (
    <div dir="rtl" className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">تتبع طلبك</h1>
      <p className="text-sm text-gray-500 mb-8">أدخل رقم الطلب لمعرفة حالته</p>

      {/* Search */}
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="TCN-2025-00001"
          dir="ltr"
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
        <button
          onClick={search}
          disabled={loading || !query.trim()}
          className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-xl text-sm transition-colors"
        >
          {loading ? '...' : 'بحث'}
        </button>
      </div>

      {notFound && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-medium">لم يُعثر على طلب بهذا الرقم</p>
          <p className="text-red-400 text-sm mt-1">تأكد من رقم الطلب في رسالة التأكيد</p>
        </div>
      )}

      {order && (
        <div className="flex flex-col gap-4">
          {/* Order header */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-rose-500 text-lg">{order.order_number}</p>
              <p className="text-xs text-gray-400">
                {new Date(order.created_at).toLocaleDateString('ar-KW', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <p className="text-sm text-gray-700 font-medium">{STATUS_LABEL[order.status]}</p>
            <p className="text-xs text-gray-400 mt-1">{STATUS_DESC[order.status]}</p>
          </div>

          {/* Status timeline */}
          {!isTerminal && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-xs text-gray-400 mb-4 font-medium">مسار الطلب</p>
              <div className="flex flex-col gap-0">
                {STATUS_STEPS.map((s, i) => {
                  const done = i <= stepIndex
                  const active = i === stepIndex
                  return (
                    <div key={s} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${done ? 'bg-rose-500' : 'bg-gray-200'} ${active ? 'ring-4 ring-rose-100' : ''}`} />
                        {i < STATUS_STEPS.length - 1 && (
                          <div className={`w-px flex-1 my-1 ${i < stepIndex ? 'bg-rose-300' : 'bg-gray-100'}`} style={{ height: '24px' }} />
                        )}
                      </div>
                      <div className="pb-5">
                        <p className={`text-sm font-medium ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                          {STATUS_LABEL[s]}
                        </p>
                        {active && <p className="text-xs text-rose-500 mt-0.5">{STATUS_DESC[s]}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Order summary */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs text-gray-400 mb-3 font-medium">تفاصيل الطلب</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>الإجمالي</span>
                <span className="font-medium text-gray-900">{Number(order.total_kwd).toFixed(3)} د.ك</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>طريقة الدفع</span>
                <span>{order.payment_method === 'cod' ? 'عند الاستلام' : order.payment_method.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>حالة الدفع</span>
                <span className={order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}>
                  {order.payment_status === 'paid' ? 'مدفوع' : 'في انتظار الدفع'}
                </span>
              </div>
              {order.delivery_slot && (
                <div className="flex justify-between text-gray-600">
                  <span>وقت التوصيل</span>
                  <span>{order.delivery_slot}</span>
                </div>
              )}
              {order.address_snapshot?.area && (
                <div className="flex justify-between text-gray-600">
                  <span>منطقة التوصيل</span>
                  <span>{order.address_snapshot.area}</span>
                </div>
              )}
            </div>
          </div>

          {/* Need help */}
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <p className="text-xs text-gray-500">تحتاج مساعدة؟</p>
            <a
              href={`https://wa.me/96598765432?text=مرحباً، لدي استفسار عن الطلب ${order.order_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-600 font-medium hover:underline"
            >
              تواصل عبر واتساب
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
