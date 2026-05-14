import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { executePayment } from '@/lib/myfatoorah'

const schema = z.object({
  orderId:      z.string(),
  orderNumber:  z.string(),
  method:       z.enum(['knet', 'visa', 'mastercard']),
  totalKwd:     z.number().positive(),
  customerName: z.string(),
  customerPhone: z.string(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ data: null, error: 'بيانات غير صحيحة' }, { status: 400 })
    }

    if (!process.env.MYFATOORAH_API_KEY) {
      return NextResponse.json({ data: null, error: 'بوابة الدفع غير مفعّلة بعد' }, { status: 503 })
    }

    // Verify order exists
    const supabase = await createClient()
    const { data: order } = await supabase
      .from('orders')
      .select('id, order_number, total_kwd, payment_status')
      .eq('id', parsed.data.orderId)
      .single()

    if (!order) {
      return NextResponse.json({ data: null, error: 'الطلب غير موجود' }, { status: 404 })
    }
    if (order.payment_status === 'paid') {
      return NextResponse.json({ data: null, error: 'هذا الطلب مدفوع بالفعل' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'
    const result = await executePayment({
      orderId:       parsed.data.orderId,
      orderNumber:   parsed.data.orderNumber,
      totalKwd:      parsed.data.totalKwd,
      method:        parsed.data.method,
      customerName:  parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      callbackUrl:   `${appUrl}/payment/result`,
      errorUrl:      `${appUrl}/payment/result?error=1`,
    })

    return NextResponse.json({ data: { paymentUrl: result.paymentUrl } }, { status: 200 })
  } catch (err) {
    console.error('Payment initiate error:', err)
    return NextResponse.json({ data: null, error: 'فشل في تهيئة الدفع' }, { status: 500 })
  }
}
