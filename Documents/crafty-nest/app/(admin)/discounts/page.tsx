import { createClient } from '@/lib/supabase/server'
import { DiscountToggle } from '@/components/admin/discount-toggle'

export default async function DiscountsPage() {
  const supabase = await createClient()

  const { data: codes } = await supabase
    .from('discount_codes')
    .select('id, code, type, value, min_order_kwd, max_uses, times_used, valid_from, valid_until, is_active')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">الخصومات</h1>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="px-5 py-3 text-right font-medium">الكود</th>
              <th className="px-5 py-3 text-right font-medium">نوع الخصم</th>
              <th className="px-5 py-3 text-right font-medium">القيمة</th>
              <th className="px-5 py-3 text-right font-medium">الحد الأدنى</th>
              <th className="px-5 py-3 text-right font-medium">الاستخدام</th>
              <th className="px-5 py-3 text-right font-medium">الصلاحية</th>
              <th className="px-5 py-3 text-right font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(codes ?? []).map(code => {
              const isExpired = code.valid_until && new Date(code.valid_until) < new Date()
              const isFull = code.max_uses !== null && code.times_used >= code.max_uses

              return (
                <tr key={code.id} className={!code.is_active || isExpired || isFull ? 'opacity-60' : ''}>
                  <td className="px-5 py-3 font-mono font-bold text-rose-500 text-xs">{code.code}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {code.type === 'percentage' ? 'نسبة مئوية' : code.type === 'free_shipping' ? 'شحن مجاني' : 'مبلغ ثابت'}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {code.type === 'percentage'
                      ? `${code.value}%`
                      : code.type === 'free_shipping'
                      ? '—'
                      : `${Number(code.value).toFixed(3)} د.ك`}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {code.min_order_kwd ? `${Number(code.min_order_kwd).toFixed(3)} د.ك` : '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {code.times_used} / {code.max_uses ?? '∞'}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {code.valid_until
                      ? new Date(code.valid_until).toLocaleDateString('ar-KW')
                      : 'غير محدد'}
                    {isExpired && <span className="mr-1 text-red-400">(منتهي)</span>}
                  </td>
                  <td className="px-5 py-3">
                    <DiscountToggle codeId={code.id} isActive={code.is_active} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(codes ?? []).length === 0 && (
          <p className="text-center text-gray-400 text-sm py-14">لا توجد أكواد خصم</p>
        )}
      </div>
    </div>
  )
}
