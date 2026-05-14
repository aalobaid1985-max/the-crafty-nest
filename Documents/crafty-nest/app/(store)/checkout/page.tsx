'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/stores/cart-store'
import { KUWAIT_AREAS, getDeliveryFee } from '@/lib/data/kuwait-areas'
import type { AddressData, CustomerData, DeliveryData, PaymentData } from '@/lib/validators/checkout-schema'
import Link from 'next/link'

type Step = 'customer' | 'address' | 'delivery' | 'payment' | 'review'

const STEPS: Step[] = ['customer', 'address', 'delivery', 'payment', 'review']
const STEP_LABELS: Record<Step, string> = {
  customer: 'بياناتك',
  address:  'العنوان',
  delivery: 'التوصيل',
  payment:  'الدفع',
  review:   'المراجعة',
}

const SLOTS = ['09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00']

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalKwd, clearCart } = useCartStore()

  const [step, setStep] = useState<Step>('customer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [customer, setCustomer] = useState<CustomerData>({ name: '', phone: '+965', email: '', giftMessage: '', discountCode: '' })
  const [address, setAddress]   = useState<AddressData>({ governorate: 'hawalli', area: '', block: '', street: '', building: '', floor: '', apartment: '' })
  const [delivery, setDelivery] = useState<DeliveryData>({ slot: '15:00-18:00' })
  const [payment, setPayment]   = useState<PaymentData>({ method: 'cod' })

  const deliveryFee = address.area ? getDeliveryFee(address.area) : 1.5
  const subtotal    = totalKwd()
  const total       = subtotal + deliveryFee

  const currentIdx  = STEPS.indexOf(step)
  const areas       = KUWAIT_AREAS[address.governorate]?.areas ?? []

  if (items.length === 0) {
    return (
      <div dir="rtl" className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">سلتك فارغة</p>
        <Link href="/products" className="text-rose-500 underline">تصفح المنتجات</Link>
      </div>
    )
  }

  async function placeOrder() {
    setLoading(true)
    setError(null)
    try {
      // Step 1: Create the order
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customer, address, delivery, payment, deliveryFee, subtotal, total }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'حدث خطأ')

      const { orderId, orderNumber } = json.data

      // Step 2: COD → go straight to confirm
      if (payment.method === 'cod') {
        clearCart()
        router.push(`/checkout/confirm?order=${orderNumber}`)
        return
      }

      // Step 3: KNET / card → initiate MyFatoorah payment
      const payRes = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          orderNumber,
          method:        payment.method,
          totalKwd:      total,
          customerName:  customer.name,
          customerPhone: customer.phone,
        }),
      })
      const payJson = await payRes.json()
      if (!payRes.ok) throw new Error(payJson.error ?? 'فشل تهيئة الدفع')

      clearCart()
      // Redirect to MyFatoorah payment page
      window.location.href = payJson.data.paymentUrl
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div dir="rtl" className="max-w-xl mx-auto px-4 py-10">

      {/* Progress */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              i < currentIdx ? 'bg-rose-500 text-white' :
              i === currentIdx ? 'bg-rose-500 text-white ring-4 ring-rose-100' :
              'bg-gray-100 text-gray-400'
            }`}>{i + 1}</div>
            <p className={`text-xs hidden sm:block ${i === currentIdx ? 'text-rose-500 font-semibold' : 'text-gray-400'}`}>
              {STEP_LABELS[s]}
            </p>
            {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < currentIdx ? 'bg-rose-300' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">

        {/* STEP 1: Customer */}
        {step === 'customer' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">بياناتك</h2>
            <Field label="الاسم *">
              <input className={input} value={customer.name} onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))} placeholder="الاسم الكامل" />
            </Field>
            <Field label="رقم الهاتف *">
              <input className={input} dir="ltr" value={customer.phone} onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))} placeholder="+96550000000" />
            </Field>
            <Field label="البريد الإلكتروني (اختياري)">
              <input className={input} dir="ltr" value={customer.email} onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
            </Field>
            <Field label="رسالة هدية (اختياري)">
              <textarea className={input} rows={2} value={customer.giftMessage} onChange={e => setCustomer(p => ({ ...p, giftMessage: e.target.value }))} placeholder="رسالتك هنا..." />
            </Field>
            <Field label="كود الخصم (اختياري)">
              <input className={input} dir="ltr" value={customer.discountCode} onChange={e => setCustomer(p => ({ ...p, discountCode: e.target.value.toUpperCase() }))} placeholder="TCN10" />
            </Field>
          </div>
        )}

        {/* STEP 2: Address */}
        {step === 'address' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">عنوان التوصيل</h2>
            <Field label="المحافظة *">
              <select className={input} value={address.governorate} onChange={e => setAddress(p => ({ ...p, governorate: e.target.value as AddressData['governorate'], area: '' }))}>
                {Object.entries(KUWAIT_AREAS).map(([key, val]) => (
                  <option key={key} value={key}>{val.nameAr}</option>
                ))}
              </select>
            </Field>
            <Field label="المنطقة *">
              <select className={input} value={address.area} onChange={e => setAddress(p => ({ ...p, area: e.target.value }))}>
                <option value="">اختر المنطقة</option>
                {areas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="القطعة *">
                <input className={input} value={address.block} onChange={e => setAddress(p => ({ ...p, block: e.target.value }))} placeholder="٨" />
              </Field>
              <Field label="الشارع *">
                <input className={input} value={address.street} onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} placeholder="٨٠" />
              </Field>
            </div>
            <Field label="رقم المنزل / المبنى *">
              <input className={input} value={address.building} onChange={e => setAddress(p => ({ ...p, building: e.target.value }))} placeholder="٥" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="الطابق">
                <input className={input} value={address.floor} onChange={e => setAddress(p => ({ ...p, floor: e.target.value }))} placeholder="٢" />
              </Field>
              <Field label="الشقة">
                <input className={input} value={address.apartment} onChange={e => setAddress(p => ({ ...p, apartment: e.target.value }))} placeholder="٤" />
              </Field>
            </div>
            {address.area && (
              <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
                🚚 رسوم التوصيل إلى {address.area}: <span className="font-bold text-gray-700">{deliveryFee.toFixed(3)} د.ك</span>
              </p>
            )}
          </div>
        )}

        {/* STEP 3: Delivery slot */}
        {step === 'delivery' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">وقت التسليم</h2>
            <p className="text-sm text-gray-500">اختر الوقت المناسب للتوصيل</p>
            <div className="flex flex-col gap-3">
              {SLOTS.map(slot => (
                <button
                  key={slot}
                  onClick={() => setDelivery({ slot: slot as DeliveryData['slot'] })}
                  className={`flex items-center justify-between border rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    delivery.slot === slot
                      ? 'border-rose-400 bg-rose-50 text-rose-600'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span>{slot}</span>
                  {delivery.slot === slot && <span className="text-rose-500">✓</span>}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400">⏰ الطلبات قبل ١ ظهراً تُوصّل في نفس اليوم لمناطق العاصمة وحولي والفروانية ومبارك الكبير</p>
          </div>
        )}

        {/* STEP 4: Payment */}
        {step === 'payment' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">طريقة الدفع</h2>
            {[
              { method: 'knet',       label: 'KNET',         sub: 'الدفع بالبطاقة المدنية',     icon: '🏦' },
              { method: 'visa',       label: 'Visa',         sub: 'بطاقة ائتمانية',             icon: '💳' },
              { method: 'mastercard', label: 'Mastercard',   sub: 'بطاقة ائتمانية',             icon: '💳' },
              { method: 'cod',        label: 'الدفع عند الاستلام', sub: `متاح للطلبات حتى ٥٠.٠٠٠ د.ك`, icon: '💵' },
            ].map(({ method, label, sub, icon }) => (
              <button
                key={method}
                onClick={() => setPayment({ method: method as PaymentData['method'] })}
                className={`flex items-center gap-3 border rounded-xl px-4 py-3 text-right transition-all ${
                  payment.method === method
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
                {payment.method === method && <span className="text-rose-500 font-bold">✓</span>}
              </button>
            ))}
            {payment.method !== 'cod' && (
              <p className="text-xs text-blue-600 bg-blue-50 rounded-xl p-3">
                ستُحوَّل إلى بوابة MyFatoorah الآمنة لإتمام الدفع.
              </p>
            )}
          </div>
        )}

        {/* STEP 5: Review */}
        {step === 'review' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">مراجعة الطلب</h2>

            <div className="bg-gray-50 rounded-xl p-4 text-sm flex flex-col gap-2">
              <p className="font-semibold text-gray-700 mb-1">المنتجات</p>
              {items.map(i => (
                <div key={i.variantId} className="flex justify-between text-gray-600">
                  <span>{i.nameAr} ({i.ageAr}) × {i.quantity}</span>
                  <span>{(i.priceKwd * i.quantity).toFixed(3)} د.ك</span>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm flex flex-col gap-1">
              <p className="font-semibold text-gray-700 mb-1">العنوان</p>
              <p className="text-gray-600">{KUWAIT_AREAS[address.governorate]?.nameAr} — {address.area}</p>
              <p className="text-gray-600">ق {address.block}، ش {address.street}، م {address.building}{address.floor ? `، ط ${address.floor}` : ''}{address.apartment ? `، شقة ${address.apartment}` : ''}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm flex flex-col gap-1">
              <div className="flex justify-between text-gray-600"><span>المجموع الفرعي</span><span>{subtotal.toFixed(3)} د.ك</span></div>
              <div className="flex justify-between text-gray-600"><span>التوصيل</span><span>{deliveryFee.toFixed(3)} د.ك</span></div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1 text-base"><span>الإجمالي</span><span>{total.toFixed(3)} د.ك</span></div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm">
              <p className="font-semibold text-gray-700 mb-1">التوصيل والدفع</p>
              <p className="text-gray-600">الوقت: {delivery.slot}</p>
              <p className="text-gray-600">الدفع: {payment.method === 'cod' ? 'عند الاستلام' : payment.method.toUpperCase()}</p>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentIdx > 0 && (
          <button
            onClick={() => setStep(STEPS[currentIdx - 1])}
            className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            السابق
          </button>
        )}
        {step !== 'review' ? (
          <button
            onClick={() => {
              if (step === 'customer' && !customer.name) return
              if (step === 'address' && (!address.area || !address.block || !address.street || !address.building)) return
              setStep(STEPS[currentIdx + 1])
            }}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            التالي
          </button>
        ) : (
          <button
            onClick={placeOrder}
            disabled={loading}
            className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading
              ? 'جاري المعالجة...'
              : payment.method === 'cod'
              ? 'تأكيد الطلب'
              : 'الدفع الآن'}
          </button>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}

const input = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white'
