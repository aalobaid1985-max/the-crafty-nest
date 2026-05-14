import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AddToCartButton } from '@/components/store/add-to-cart-button'
import { MessageCircle } from 'lucide-react'

const AGE_LABEL: Record<string, string> = {
  'flower-shop-2-4': '٢-٤ سنوات',
  'flower-shop-4-6': '٤-٦ سنوات',
  'flower-shop-6-8': '٦-٨ سنوات',
  'car-shop-2-4':    '٢-٤ سنوات',
  'car-shop-4-6':    '٤-٦ سنوات',
  'car-shop-6-8':    '٦-٨ سنوات',
}

const EMOJI: Record<string, string> = {
  'flower-shop-2-4': '🌸',
  'flower-shop-4-6': '🌸',
  'flower-shop-6-8': '🌸',
  'car-shop-2-4':    '🚗',
  'car-shop-4-6':    '🚗',
  'car-shop-6-8':    '🚗',
}

interface PackageItem { name: string; type: string; qty: number }

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('id, slug, name_ar, name_en, description_ar, age_min, age_max, price_kwd, skill_tags, interaction_type, category_id')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  const { data: variant } = await supabase
    .from('product_variants')
    .select('id, sku, price_kwd')
    .eq('product_id', product.id)
    .eq('is_active', true)
    .single()

  const { data: inventoryRow } = await supabase
    .from('inventory')
    .select('quantity_on_hand, quantity_reserved')
    .eq('variant_id', variant?.id ?? '')
    .single()

  const { data: settingsRow } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', 'packages_content')
    .single()

  const packagesContent: Record<string, PackageItem[]> = settingsRow?.value ?? {}
  const contents: PackageItem[] = packagesContent[slug] ?? []

  // If RLS blocks inventory read, assume in stock — stock is validated server-side at order time
  const available = inventoryRow
    ? inventoryRow.quantity_on_hand - inventoryRow.quantity_reserved
    : 99

  const skillLabels: Record<string, string> = {
    fine_motor: 'الحركة الدقيقة',
    gross_motor: 'الحركة الكبرى',
    creativity: 'الإبداع',
    counting_math: 'العد والحساب',
    letters_language: 'الحروف واللغة',
    colors_shapes: 'الألوان والأشكال',
    problem_solving: 'حل المشكلات',
    social_emotional: 'المهارات الاجتماعية',
    science_stem: 'العلوم والتكنولوجيا',
    storytelling: 'السرد القصصي',
  }

  const interactionLabels: Record<string, string> = {
    solo: 'فردي',
    parent_child: 'أهل وأطفال',
    peer_group: 'مجموعة',
  }

  const whatsappText = encodeURIComponent(`مرحبا، أود الطلب:\n${product.name_ar}\nالسعر: ${Number(product.price_kwd).toFixed(3)} د.ك`)

  return (
    <div dir="rtl" className="max-w-4xl mx-auto px-4 py-10">

      {/* Back */}
      <a href="/products" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">
        ← العودة للمنتجات
      </a>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Image placeholder */}
        <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-3xl flex items-center justify-center aspect-square text-8xl border border-rose-100">
          {EMOJI[slug] ?? '🎁'}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm text-gray-400 mb-1">{AGE_LABEL[slug]}</p>
            <h1 className="text-2xl font-bold text-gray-900">{product.name_ar}</h1>
          </div>

          <p className="text-3xl font-bold text-gray-900">
            {Number(product.price_kwd).toFixed(3)} <span className="text-lg font-normal text-gray-500">د.ك</span>
          </p>

          <p className="text-gray-600 text-sm leading-relaxed">{product.description_ar}</p>

          {/* Skills */}
          {product.skill_tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(product.skill_tags as string[]).map(tag => (
                <span key={tag} className="text-xs bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1 rounded-full">
                  {skillLabels[tag] ?? tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex gap-4 text-sm text-gray-500">
            <span>👥 {interactionLabels[product.interaction_type as string] ?? product.interaction_type}</span>
            <span>📦 {available > 0 ? `${available} متوفر` : 'غير متوفر'}</span>
          </div>

          {/* Delivery note */}
          <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
            🚚 التوصيل ١.٥٠٠ د.ك لجميع مناطق الكويت
          </p>

          {/* Add to cart */}
          {variant && available > 0 && (
            <AddToCartButton
              item={{
                variantId: variant.id,
                slug: product.slug,
                nameAr: product.name_ar,
                nameEn: product.name_en ?? '',
                ageAr: AGE_LABEL[slug] ?? '',
                priceKwd: Number(product.price_kwd),
              }}
            />
          )}

          {/* WhatsApp */}
          <a
            href={`https://wa.me/96550499867?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-green-500 text-green-600 font-semibold hover:bg-green-50 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            اطلب عبر واتساب
          </a>
        </div>
      </div>

      {/* Package contents */}
      {contents.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-5">محتويات الباقة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contents.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm">
                <span className="text-gray-800">{item.name}</span>
                <div className="flex items-center gap-2 text-gray-400">
                  <span>{item.type}</span>
                  {item.qty > 1 && <span className="bg-rose-100 text-rose-600 text-xs px-2 py-0.5 rounded-full">×{item.qty}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
