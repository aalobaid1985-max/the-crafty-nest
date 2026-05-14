import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

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

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, payment_method, payment_status, total_kwd, delivery_slot, created_at, address_snapshot')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">الطلبات</h1>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="px-5 py-3 text-right font-medium">رقم الطلب</th>
              <th className="px-5 py-3 text-right font-medium">الاسم</th>
              <th className="px-5 py-3 text-right font-medium">الهاتف</th>
              <th className="px-5 py-3 text-right font-medium">المبلغ</th>
              <th className="px-5 py-3 text-right font-medium">الدفع</th>
              <th className="px-5 py-3 text-right font-medium">الحالة</th>
              <th className="px-5 py-3 text-right font-medium">التاريخ</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(orders ?? []).map(order => {
              const snap = order.address_snapshot as Record<string, string>
              return (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-rose-500">
                    <Link href={`/admin/orders/${order.id}`}>{order.order_number}</Link>
                  </td>
                  <td className="px-5 py-3 text-gray-700">{snap?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs" dir="ltr">{snap?.phone ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-700">{Number(order.total_kwd).toFixed(3)} د.ك</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.payment_method === 'cod' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {order.payment_method === 'cod' ? 'عند الاستلام' : order.payment_method.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(order.created_at).toLocaleDateString('ar-KW')}
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-xs text-rose-500 hover:underline">تفاصيل</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(orders ?? []).length === 0 && (
          <p className="text-center text-gray-400 text-sm py-14">لا توجد طلبات بعد</p>
        )}
      </div>
    </div>
  )
}
