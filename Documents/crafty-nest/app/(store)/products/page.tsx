import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const SWATCH: Record<string, { hue: number; label: string }> = {
  'flower-shop-2-4': { hue: 340, label: '٢-٤ سنوات' },
  'flower-shop-4-6': { hue: 340, label: '٤-٦ سنوات' },
  'flower-shop-6-8': { hue: 340, label: '٦-٨ سنوات' },
  'car-shop-2-4':    { hue: 220, label: '٢-٤ سنوات' },
  'car-shop-4-6':    { hue: 220, label: '٤-٦ سنوات' },
  'car-shop-6-8':    { hue: 220, label: '٦-٨ سنوات' },
}

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('id, slug, name_ar, price_kwd, age_min, age_max')
    .eq('is_active', true)
    .order('age_min')

  return (
    <div className="max-w-[1320px] mx-auto px-14 py-14" style={{ paddingInline: 'clamp(22px, 4vw, 56px)' }}>

      {/* Page header */}
      <div className="mb-10" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '36px' }}>
        <div className="inline-flex items-center gap-2.5 mb-5" style={{ color: 'var(--muted)', fontSize: '12px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 0 4px color-mix(in oklab, var(--accent) 18%, transparent)' }} />
          باقات مغناطيسية تعليمية
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1, letterSpacing: '-0.02em', margin: 0 }}>
          جميع المنتجات
        </h1>
        <p className="mt-4" style={{ color: 'var(--muted)', fontSize: '16px' }}>
          ستة باقات مصممة للأطفال من ٢ إلى ٨ سنوات • <span style={{ fontFamily: 'var(--font-display)' }}>٩.٥٠٠ د.ك</span> للباقة
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {(products ?? []).map(p => {
          const sw = SWATCH[p.slug] ?? { hue: 30, label: '' }
          const bg = `oklch(0.88 0.04 ${sw.hue})`
          const stripe = `oklch(0.83 0.055 ${sw.hue})`

          return (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="flex flex-col gap-3.5 group"
            >
              {/* Swatch image */}
              <div className="relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.012]" style={{ aspectRatio: '4/5', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: bg }}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                  <defs>
                    <pattern id={`s-${p.id}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                      <rect width="8" height="8" fill={bg} />
                      <line x1="0" y1="0" x2="0" y2="8" stroke={stripe} strokeWidth="3" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill={`url(#s-${p.id})`} />
                </svg>
                {/* Age badge */}
                <span className="absolute bottom-2.5 right-3 font-mono text-[10.5px] tracking-wide opacity-70" style={{ color: `oklch(0.35 0.05 ${sw.hue})` }}>
                  {sw.label}
                </span>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline gap-2">
                  <p
                    className="transition-colors group-hover:text-[--accent]"
                    style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.005em', margin: 0, color: 'var(--ink)' }}
                  >
                    {p.name_ar}
                  </p>
                  <span className="tabular-nums text-sm flex-shrink-0" style={{ color: 'var(--ink)' }}>
                    {Number(p.price_kwd).toFixed(3)} د.ك
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {p.age_min}–{p.age_max} سنوات
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {(products ?? []).length === 0 && (
        <p className="text-center py-20" style={{ color: 'var(--muted)', fontFamily: 'var(--font-display)', fontSize: '22px' }}>
          لا توجد منتجات حالياً
        </p>
      )}
    </div>
  )
}
