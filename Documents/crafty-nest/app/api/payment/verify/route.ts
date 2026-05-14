import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getPaymentStatus } from '@/lib/myfatoorah'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json({ data: null, error: 'معرف الدفع مفقود' }, { status: 400 })
    }

    const status = await getPaymentStatus(paymentId)
    if (!status.isPaid) {
      return NextResponse.json({ data: null, error: 'لم يتم الدفع' }, { status: 402 })
    }

    const supabase = await createClient()
    // referenceId is the orderId we passed as UserDefinedField
    await supabase
      .from('orders')
      .update({ payment_status: 'paid' } as never)
      .eq('id', status.referenceId)

    // Get order number for redirect
    const { data: order } = await supabase
      .from('orders')
      .select('order_number')
      .eq('id', status.referenceId)
      .single()

    return NextResponse.json({ data: { orderNumber: order?.order_number, orderId: status.referenceId } })
  } catch (err) {
    console.error('Payment verify error:', err)
    return NextResponse.json({ data: null, error: 'فشل التحقق من الدفع' }, { status: 500 })
  }
}
