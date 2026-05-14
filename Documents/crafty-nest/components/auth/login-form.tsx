'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 'phone' | 'otp'

export function LoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function sendOtp() {
    setError(null)
    const cleaned = phone.replace(/\s/g, '')
    if (!/^\+9656\d{7}$|^\+9659\d{7}$|^\+96550\d{6}$|^\+965[569]\d{7}$/.test(cleaned)) {
      setError('أدخل رقم كويتي صحيح (مثال: +96512345678)')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ phone: cleaned })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setStep('otp')
  }

  async function verifyOtp() {
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      phone: phone.replace(/\s/g, ''),
      token: otp,
      type: 'sms',
    })
    setLoading(false)
    if (error) {
      setError('الرمز غير صحيح أو انتهت صلاحيته')
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {step === 'phone' ? (
        <>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">تسجيل الدخول</h2>
          <p className="text-sm text-gray-500 mb-6">أدخل رقم هاتفك وسنرسل لك رمز التحقق</p>

          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
            رقم الهاتف
          </label>
          <input
            id="phone"
            type="tel"
            dir="ltr"
            placeholder="+965 5XXX XXXX"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 mb-4"
          />

          {error && <p className="text-red-500 text-sm mb-4 text-right">{error}</p>}

          <button
            onClick={sendOtp}
            disabled={loading || !phone}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-medium rounded-xl py-3 text-sm transition-colors"
          >
            {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
          </button>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">أدخل رمز التحقق</h2>
          <p className="text-sm text-gray-500 mb-6">
            أرسلنا رمزاً من 6 أرقام إلى {phone}
          </p>

          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="otp">
            رمز التحقق
          </label>
          <input
            id="otp"
            type="text"
            dir="ltr"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-rose-400 mb-4"
          />

          {error && <p className="text-red-500 text-sm mb-4 text-right">{error}</p>}

          <button
            onClick={verifyOtp}
            disabled={loading || otp.length < 6}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-medium rounded-xl py-3 text-sm transition-colors mb-3"
          >
            {loading ? 'جاري التحقق...' : 'تأكيد'}
          </button>

          <button
            onClick={() => { setStep('phone'); setOtp(''); setError(null) }}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            تغيير رقم الهاتف
          </button>
        </>
      )}
    </div>
  )
}
