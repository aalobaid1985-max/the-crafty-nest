import { createClient } from '@/lib/supabase/server'
import { StockAdjustButton } from '@/components/admin/stock-adjust-button'

export default async function InventoryPage() {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('inventory')
    .select(`
      variant_id, quantity_on_hand, quantity_reserved, low_stock_threshold,
      product_variants (
        id, name, sku,
        products ( id, name_ar )
      )
    `)
    .order('quantity_on_hand', { ascending: true })

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">المخزون</h1>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="px-5 py-3 text-right font-medium">المنتج</th>
              <th className="px-5 py-3 text-right font-medium">الباركود</th>
              <th className="px-5 py-3 text-right font-medium">المتاح</th>
              <th className="px-5 py-3 text-right font-medium">محجوز</th>
              <th className="px-5 py-3 text-right font-medium">الحد الأدنى</th>
              <th className="px-5 py-3 text-right font-medium">الحالة</th>
              <th className="px-5 py-3 text-right font-medium">تعديل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(rows ?? []).map(row => {
              const variant = row.product_variants as unknown as { id: string; name: string; sku: string; products: { name_ar: string } } | null
              const available = row.quantity_on_hand - row.quantity_reserved
              const isLow = available <= row.low_stock_threshold
              const isOut = available <= 0

              return (
                <tr key={row.variant_id} className={isOut ? 'bg-red-50' : isLow ? 'bg-amber-50' : ''}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{variant?.products?.name_ar ?? '—'}</p>
                    {variant?.name && <p className="text-xs text-gray-400">{variant.name}</p>}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs font-mono">{variant?.sku ?? '—'}</td>
                  <td className="px-5 py-3 font-bold text-gray-800">{available}</td>
                  <td className="px-5 py-3 text-gray-500">{row.quantity_reserved}</td>
                  <td className="px-5 py-3 text-gray-400">{row.low_stock_threshold}</td>
                  <td className="px-5 py-3">
                    {isOut ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">نفد</span>
                    ) : isLow ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">منخفض</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">متوفر</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <StockAdjustButton variantId={row.variant_id} currentQty={row.quantity_on_hand} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(rows ?? []).length === 0 && (
          <p className="text-center text-gray-400 text-sm py-14">لا توجد بيانات مخزون</p>
        )}
      </div>
    </div>
  )
}
