'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PaymentResultPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  useEffect(() => {
    const paymentId = searchParams.get('paymentId')
    const error = searchParams.get('error')

    if (error || !paymentId) {
      setStatus('failed')
      return
    }

    fetch(`/api/payment/verify?paymentId=${paymentId}`)
      .then(r => r.json())
      .then(json => {
        if (json.data?.orderNumber) {
          setOrderNumber(json.data.orderNumber)
          setStatus('success')
          // clear cart happens in checkout — redirect to confirm
          setTimeout(() => {
            router.push(`/checkout/confirm?order=${json.data.orderNumber}`)
          }, 2000)
        } else {
          setStatus('failed')
        }
      })
      .catch(() => setStatus('failed'))
  }, [searchParams, router])

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-600 font-medium">جاري التحقق من الدفع...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✓</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">تم الدفع بنجاح</h1>
            <p className="text-gray-500 text-sm mb-1">رقم طلبك: <span className="font-medium text-rose-500">{orderNumber}</span></p>
            <p className="text-gray-400 text-xs">سيتم تحويلك تلقائياً...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✕</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">لم يتم الدفع</h1>
            <p className="text-gray-500 text-sm mb-6">حدث خطأ أثناء معالجة الدفع. لم يتم خصم أي مبلغ من حسابك.</p>
            <div className="flex flex-col gap-2">
              <Link href="/checkout" className="bg-rose-500 text-white font-medium py-3 rounded-xl text-sm">
                حاول مرة أخرى
              </Link>
              <a
                href="https://wa.me/96598765432"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:underline"
              >
                تواصل معنا عبر واتساب
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
