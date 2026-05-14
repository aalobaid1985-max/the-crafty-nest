import { z } from 'zod'

export const addressSchema = z.object({
  governorate: z.enum(['capital','hawalli','farwaniya','ahmadi','jahra','mubarak_al_kabeer'], {
    error: 'اختر المحافظة',
  }),
  area:       z.string().min(1, 'اختر المنطقة'),
  block:      z.string().min(1, 'أدخل رقم القطعة'),
  street:     z.string().min(1, 'أدخل اسم الشارع'),
  building:   z.string().min(1, 'أدخل رقم المنزل / المبنى'),
  floor:      z.string().optional(),
  apartment:  z.string().optional(),
})

export const customerSchema = z.object({
  name:  z.string().min(2, 'أدخل اسمك'),
  phone: z.string().regex(/^\+9656\d{7}$|^\+9659\d{7}$|^\+96550\d{6}$|^\+965[569]\d{7}$/, 'أدخل رقم كويتي صحيح'),
  email: z.string().email('بريد إلكتروني غير صحيح').optional().or(z.literal('')),
  giftMessage: z.string().max(200).optional(),
  discountCode: z.string().optional(),
})

export const deliverySchema = z.object({
  slot: z.enum(['09:00-12:00','12:00-15:00','15:00-18:00','18:00-21:00'], {
    error: 'اختر وقت التسليم',
  }),
})

export const paymentSchema = z.object({
  method: z.enum(['knet','visa','mastercard','cod'], {
    error: 'اختر طريقة الدفع',
  }),
})

export type AddressData   = z.infer<typeof addressSchema>
export type CustomerData  = z.infer<typeof customerSchema>
export type DeliveryData  = z.infer<typeof deliverySchema>
export type PaymentData   = z.infer<typeof paymentSchema>
