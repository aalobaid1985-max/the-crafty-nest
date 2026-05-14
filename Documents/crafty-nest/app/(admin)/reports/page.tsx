import { createClient } from '@/lib/supabase/server'

export default async function ReportsPage() {
  const supabase = await createClient()

  const [{ data: orders }, { data: items }] = await Promise.all([
    supabase.from('orders').select('id, status, payment_method, total_kwd, delivery_fee_kwd, discount_kwd, created_at').order('created_at', { ascending: false }),
    supabase.from('order_items').select('product_snapshot, quantity, unit_price_kwd'),
  ])

  const completed = (orders ?? []).filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
  const totalRevenue = completed.reduce((s, o) => s + Number(o.total_kwd), 0)
  const totalDelivery = completed.reduce((s, o) => s + Number(o.delivery_fee_kwd), 0)
  const totalDiscount = (orders ?? []).reduce((s, o) => s + Number(o.discount_kwd), 0)
  const codCount = (orders ?? []).filter(o => o.payment_method === 'cod').length
  const onlineCount = (orders ?? []).filter(o => o.payment_method !== 'cod').length

  // Sales by day (last 14 days)
  const byDay: Record<string, number> = {}
  for (const o of completed) {
    const day = new Date(o.created_at).toLocaleDateString('ar-KW', { month: 'short', day: 'numeric' })
    byDay[day] = (byDay[day] ?? 0) + Number(o.total_kwd)
  }

  // Top products
  const byProduct: Record<string, { qty: number; revenue: number }> = {}
  for (const item of items ?? []) {
    const snap = item.product_snapshot as Record<string, string> | null
    const key = snap?.nameAr ?? 'غير معروف'
    if (!byProduct[key]) byProduct[key] = { qty: 0, revenue: 0 }
    byProduct[key].qty += item.quantity
    byProduct[key].revenue += item.quantity * Number(item.unit_price_kwd)
  }
  const topProducts = Object.entries(byProduct).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 6)

  const kpiCards = [
    { label: 'إجمالي الإيرادات', value: `${totalRevenue.toFixed(3)} د.ك`, color: 'text-green-600' },
    { label: 'إجمالي الطلبات', value: (orders ?? []).length, color: 'text-blue-600' },
    { label: 'رسوم التوصيل', value: `${totalDelivery.toFixed(3)} د.ك`, color: 'text-indigo-600' },
    { label: 'إجمالي الخصومات', value: `${totalDiscount.toFixed(3)} د.ك`, color: 'text-rose-600' },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">التقارير</h1>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Payment method split */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <p className="font-bold text-gray-900 mb-4">طرق الدفع</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-orange-600 font-medium">عند الاستلام</span>
                <span className="text-gray-500">{codCount} طلب</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-orange-400 h-2 rounded-full"
                  style={{ width: `${(orders ?? []).length ? (codCount / (orders ?? []).length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-600 font-medium">بطاقة / KNET</span>
                <span className="text-gray-500">{onlineCount} طلب</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-400 h-2 rounded-full"
                  style={{ width: `${(orders ?? []).length ? (onlineCount / (orders ?? []).length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <p className="font-bold text-gray-900 mb-4">حالة الطلبات</p>
          <div className="space-y-2">
            {[
              { key: 'pending', label: 'قيد الانتظار', color: 'text-amber-600' },
              { key: 'confirmed', label: 'مؤكد', color: 'text-blue-600' },
              { key: 'packed', label: 'جاهز', color: 'text-purple-600' },
              { key: 'shipped', label: 'قيد التوصيل', color: 'text-indigo-600' },
              { key: 'delivered', label: 'تم التسليم', color: 'text-green-600' },
              { key: 'cancelled', label: 'ملغي', color: 'text-red-500' },
            ].map(({ key, label, color }) => {
              const count = (orders ?? []).filter(o => o.status === key).length
              return (
                <div key={key} className="flex justify-between text-sm">
                  <span className={`${color} font-medium`}>{label}</span>
                  <span className="text-gray-500">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="font-bold text-gray-900">المنتجات الأكثر مبيعاً</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-400 text-xs">
            <tr>
              <th className="px-5 py-3 text-right font-medium">المنتج</th>
              <th className="px-5 py-3 text-right font-medium">الكمية المباعة</th>
              <th className="px-5 py-3 text-right font-medium">الإيراد</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {topProducts.map(([name, { qty, revenue }]) => (
              <tr key={name}>
                <td className="px-5 py-3 font-medium text-gray-800">{name}</td>
                <td className="px-5 py-3 text-gray-600">{qty}</td>
                <td className="px-5 py-3 text-gray-700 font-medium">{revenue.toFixed(3)} د.ك</td>
              </tr>
            ))}
          </tbody>
        </table>
        {topProducts.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">لا توجد بيانات مبيعات</p>
        )}
      </div>
    </div>
  )
}
