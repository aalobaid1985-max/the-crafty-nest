import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  pending: 'قيد الانتظار', confirmed: 'مؤكد', packed: 'جاهز للتوصيل',
  shipped: 'قيد التوصيل', delivered: 'تم التسليم', cancelled: 'ملغي', refunded: 'مسترجع',
}
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-blue-100 text-blue-700',
  packed: 'bg-purple-100 text-purple-700', shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: orders }, { data: inventory }] = await Promise.all([
    supabase.from('orders').select('id, order_number, status, total_kwd, created_at, address_snapshot').order('created_at', { ascending: false }).limit(10),
    supabase.from('inventory').select('variant_id, quantity_on_hand, quantity_reserved, low_stock_threshold'),
  ])

  const totalRevenue = (orders ?? []).filter(o => o.status !== 'cancelled' && o.status !== 'refunded').reduce((sum, o) => sum + Number(o.total_kwd), 0)
  const pendingCount = (orders ?? []).filter(o => o.status === 'pending').length
  const lowStock = (inventory ?? []).filter(i => (i.quantity_on_hand - i.quantity_reserved) <= i.low_stock_threshold)

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">لوحة التحكم</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'إجمالي المبيعات', value: `${totalRevenue.toFixed(3)} د.ك`, color: 'text-green-600' },
          { label: 'طلبات اليوم',     value: (orders ?? []).filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length, color: 'text-blue-600' },
          { label: 'بانتظار التأكيد', value: pendingCount, color: 'text-amber-600' },
          { label: 'منتجات منخفضة',  value: lowStock.length, color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">آخر الطلبات</h2>
          <Link href="/admin/orders" className="text-xs text-rose-500 hover:underline">عرض الكل</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="px-5 py-3 text-right font-medium">رقم الطلب</th>
              <th className="px-5 py-3 text-right font-medium">الاسم</th>
              <th className="px-5 py-3 text-right font-medium">المبلغ</th>
              <th className="px-5 py-3 text-right font-medium">الحالة</th>
              <th className="px-5 py-3 text-right font-medium">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(orders ?? []).slice(0, 8).map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-rose-500 hover:underline font-medium">
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-5 py-3 text-gray-700">{(order.address_snapshot as Record<string, string>)?.name ?? '—'}</td>
                <td className="px-5 py-3 text-gray-700">{Number(order.total_kwd).toFixed(3)} د.ك</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {new Date(order.created_at).toLocaleDateString('ar-KW')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(orders ?? []).length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">لا توجد طلبات بعد</p>
        )}
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <p className="font-bold text-red-700 mb-2">⚠️ تنبيه مخزون منخفض</p>
          <p className="text-sm text-red-600">{lowStock.length} منتج وصل للحد الأدنى — <Link href="/admin/inventory" className="underline">إدارة المخزون</Link></p>
        </div>
      )}
    </div>
  )
}
