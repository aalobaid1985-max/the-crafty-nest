import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const EMOJI: Record<string, string> = {
  'flower-shop-2-4': '🌸', 'flower-shop-4-6': '🌸', 'flower-shop-6-8': '🌸',
  'car-shop-2-4': '🚗',    'car-shop-4-6': '🚗',    'car-shop-6-8': '🚗',
}

const AGE_LABEL: Record<string, string> = {
  'flower-shop-2-4': '٢-٤ سنوات', 'flower-shop-4-6': '٤-٦ سنوات', 'flower-shop-6-8': '٦-٨ سنوات',
  'car-shop-2-4': '٢-٤ سنوات',   'car-shop-4-6': '٤-٦ سنوات',   'car-shop-6-8': '٦-٨ سنوات',
}

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('id, slug, name_ar, price_kwd, interaction_type')
    .eq('is_active', true)
    .order('age_min')

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">جميع المنتجات</h1>
      <p className="text-gray-500 mb-8">باقات مغناطيسية تعليمية • ٩.٥٠٠ د.ك للباقة</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {(products ?? []).map(p => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col gap-3"
          >
            <div className="text-4xl">{EMOJI[p.slug] ?? '🎁'}</div>
            <div>
              <p className="font-bold text-gray-900">{p.name_ar}</p>
              <p className="text-sm text-gray-400">{AGE_LABEL[p.slug]}</p>
            </div>
            <div className="mt-auto flex items-center justify-between">
              <span className="font-bold text-gray-900">{Number(p.price_kwd).toFixed(3)} د.ك</span>
              <span className="text-xs bg-rose-50 text-rose-500 border border-rose-100 px-3 py-1 rounded-full">
                عرض التفاصيل
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
