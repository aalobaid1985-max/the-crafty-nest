import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { OrderStatusButtons } from '@/components/admin/order-status-buttons'

const STATUS_LABEL: Record<string, string> = {
  pending: 'قيد الانتظار', confirmed: 'مؤكد', packed: 'جاهز',
  shipped: 'قيد التوصيل', delivered: 'تم التسليم', cancelled: 'ملغي', refunded: 'مسترجع',
}
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-blue-100 text-blue-700',
  packed: 'bg-purple-100 text-purple-700', shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
}
const STATUS_FLOW = ['pending', 'confirmed', 'packed', 'shipped', 'delivered']

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, status, payment_method, payment_status, total_kwd, delivery_fee_kwd, subtotal_kwd, discount_kwd, delivery_slot, notes, created_at, address_snapshot')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const { data: items } = await supabase
    .from('order_items')
    .select('id, quantity, unit_price_kwd, total_kwd, product_snapshot')
    .eq('order_id', id)

  const snap = order.address_snapshot as Record<string, string>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/orders" className="text-gray-400 hover:text-gray-600 text-sm">← الطلبات</Link>
        <span className="text-gray-300">/</span>
        <span className="text-rose-500 font-bold">{order.order_number}</span>
        <span className={`mr-auto px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      {/* Status flow buttons */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
        <p className="text-xs text-gray-400 mb-3 font-medium">تحديث الحالة</p>
        <OrderStatusButtons orderId={order.id} currentStatus={order.status} statusFlow={STATUS_FLOW} />
      </div>

      {/* Customer + address */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <p className="text-xs text-gray-400 mb-3 font-medium">معلومات العميل</p>
          <p className="font-semibold text-gray-800">{snap?.name ?? '—'}</p>
          <p className="text-sm text-gray-500 mt-1" dir="ltr">{snap?.phone ?? '—'}</p>
          {snap?.notes && <p className="text-xs text-gray-400 mt-2 border-t border-gray-50 pt-2">{snap.notes}</p>}
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <p className="text-xs text-gray-400 mb-3 font-medium">عنوان التوصيل</p>
          <p className="text-sm text-gray-700">{snap?.governorate} — {snap?.area}</p>
          {snap?.block && <p className="text-sm text-gray-500 mt-1">قطعة {snap.block}، شارع {snap.street}، منزل {snap.house}</p>}
          {snap?.apartment && <p className="text-sm text-gray-400">شقة {snap.apartment}</p>}
          {order.delivery_slot && (
            <p className="text-xs text-indigo-600 mt-2 bg-indigo-50 rounded-lg px-2 py-1 inline-block">
              {order.delivery_slot}
            </p>
          )}
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="font-bold text-gray-900">المنتجات</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-400 text-xs">
            <tr>
              <th className="px-5 py-3 text-right font-medium">المنتج</th>
              <th className="px-5 py-3 text-right font-medium">الكمية</th>
              <th className="px-5 py-3 text-right font-medium">السعر</th>
              <th className="px-5 py-3 text-right font-medium">المجموع</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(items ?? []).map(item => {
              const snap = item.product_snapshot as Record<string, string>
              return (
                <tr key={item.id}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{snap?.nameAr ?? '—'}</p>
                    {snap?.variantName && <p className="text-xs text-gray-400">{snap.variantName}</p>}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{item.quantity}</td>
                  <td className="px-5 py-3 text-gray-600">{Number(item.unit_price_kwd).toFixed(3)} د.ك</td>
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {Number(item.total_kwd).toFixed(3)} د.ك
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Order totals + payment */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <p className="text-xs text-gray-400 mb-3 font-medium">الدفع</p>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.payment_method === 'cod' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
              {order.payment_method === 'cod' ? 'عند الاستلام' : order.payment_method?.toUpperCase()}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {order.payment_status === 'paid' ? 'مدفوع' : 'في انتظار الدفع'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            {new Date(order.created_at).toLocaleDateString('ar-KW', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <p className="text-xs text-gray-400 mb-3 font-medium">الملخص المالي</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>المجموع الفرعي</span>
              <span>{Number(order.subtotal_kwd).toFixed(3)} د.ك</span>
            </div>
            {Number(order.discount_kwd) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>الخصم</span>
                <span>- {Number(order.discount_kwd).toFixed(3)} د.ك</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>التوصيل</span>
              <span>{Number(order.delivery_fee_kwd).toFixed(3)} د.ك</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>الإجمالي</span>
              <span>{Number(order.total_kwd).toFixed(3)} د.ك</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
