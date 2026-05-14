import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const orderBodySchema = z.object({
  items: z.array(z.object({
    variantId: z.string(),
    nameAr:    z.string(),
    nameEn:    z.string(),
    ageAr:     z.string(),
    priceKwd:  z.number(),
    quantity:  z.number().int().positive(),
    slug:      z.string(),
  })),
  customer: z.object({
    name:         z.string(),
    phone:        z.string(),
    email:        z.string().optional(),
    giftMessage:  z.string().optional(),
    discountCode: z.string().optional(),
  }),
  address: z.object({
    governorate: z.string(),
    area:        z.string(),
    block:       z.string(),
    street:      z.string(),
    building:    z.string(),
    floor:       z.string().optional(),
    apartment:   z.string().optional(),
  }),
  delivery: z.object({ slot: z.string() }),
  payment:  z.object({ method: z.enum(['knet','visa','mastercard','cod']) }),
  deliveryFee: z.number(),
  subtotal:    z.number(),
  total:       z.number(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = orderBodySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ data: null, error: 'بيانات غير صحيحة' }, { status: 400 })
    }

    const { items, customer, address, delivery, payment, deliveryFee, subtotal, total } = parsed.data
    const supabase = await createClient()

    // Validate stock availability for all items
    for (const item of items) {
      const { data: inv } = await supabase
        .from('inventory')
        .select('quantity_on_hand, quantity_reserved')
        .eq('variant_id', item.variantId)
        .single()

      if (!inv || (inv.quantity_on_hand - inv.quantity_reserved) < item.quantity) {
        return NextResponse.json(
          { data: null, error: `${item.nameAr} — الكمية المطلوبة غير متوفرة` },
          { status: 400 }
        )
      }
    }

    // Validate discount code if provided
    let discountKwd = 0
    if (customer.discountCode) {
      const { data: code } = await supabase
        .from('discount_codes')
        .select('id, type, value, min_order_kwd, max_uses, times_used')
        .eq('code', customer.discountCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (code) {
        if (!code.max_uses || code.times_used < code.max_uses) {
          if (!code.min_order_kwd || subtotal >= code.min_order_kwd) {
            if (code.type === 'percentage') discountKwd = subtotal * code.value
            if (code.type === 'fixed_kwd')  discountKwd = code.value
            if (code.type === 'free_shipping') discountKwd = deliveryFee
          }
        }
      }
    }

    // COD fee
    const codFee = payment.method === 'cod' ? 1.0 : 0
    const finalTotal = subtotal - discountKwd + deliveryFee + codFee

    const addressSnapshot = {
      name:        customer.name,
      phone:       customer.phone,
      governorate: address.governorate,
      area:        address.area,
      block:       address.block,
      street:      address.street,
      building:    address.building,
      floor:       address.floor ?? '',
      apartment:   address.apartment ?? '',
      giftMessage: customer.giftMessage ?? '',
    }

    // Create order (RLS: guest order with no customer_id)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        payment_method:     payment.method,
        delivery_slot:      delivery.slot as 'type',
        subtotal_kwd:       subtotal,
        discount_kwd:       discountKwd,
        delivery_fee_kwd:   deliveryFee,
        cod_fee_kwd:        codFee,
        gift_card_applied_kwd: 0,
        total_kwd:          finalTotal,
        address_snapshot:   addressSnapshot,
        notes:              customer.giftMessage ?? null,
      })
      .select('id, order_number')
      .single()

    if (orderError || !order) {
      console.error('Order creation error:', orderError)
      return NextResponse.json({ data: null, error: 'فشل إنشاء الطلب' }, { status: 500 })
    }

    // Insert order items
    const orderItems = items.map(item => ({
      order_id:    order.id,
      variant_id:  item.variantId,
      product_snapshot: {
        nameAr:   item.nameAr,
        nameEn:   item.nameEn,
        ageAr:    item.ageAr,
        sku:      item.slug,
        priceKwd: item.priceKwd,
      },
      quantity:       item.quantity,
      unit_price_kwd: item.priceKwd,
      total_kwd:      item.priceKwd * item.quantity,
    }))

    await supabase.from('order_items').insert(orderItems)

    // Reserve inventory (best-effort — graceful if RPC not yet created)
    for (const item of items) {
      try {
        await supabase.rpc('increment_reserved', {
          p_variant_id: item.variantId,
          p_qty:        item.quantity,
        })
      } catch {
        // RPC may not exist yet — stock is reconciled on order confirm
      }
    }

    // Increment discount code usage
    if (customer.discountCode && discountKwd > 0) {
      const { data: currentCode } = await supabase
        .from('discount_codes')
        .select('times_used')
        .eq('code', customer.discountCode.toUpperCase())
        .single()
      if (currentCode) {
        await supabase
          .from('discount_codes')
          .update({ times_used: (currentCode.times_used ?? 0) + 1 } as never)
          .eq('code', customer.discountCode.toUpperCase())
      }
    }

    return NextResponse.json({ data: { orderId: order.id, orderNumber: order.order_number } }, { status: 201 })
  } catch (err) {
    console.error('Order API error:', err)
    return NextResponse.json({ data: null, error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
