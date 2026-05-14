'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import Link from 'next/link'
import { Trash2, Plus, Minus } from 'lucide-react'

const DELIVERY_FEE = 1.5

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalKwd, clearCart } = useCartStore()

  const subtotal = totalKwd()
  const delivery = items.length > 0 ? DELIVERY_FEE : 0
  const total = subtotal + delivery

  const whatsappLines = items.map(i => `• ${i.nameAr} (${i.ageAr}) × ${i.quantity} = ${(i.priceKwd * i.quantity).toFixed(3)} د.ك`).join('\n')
  const whatsappText = encodeURIComponent(
    `مرحبا، أود الطلب:\n${whatsappLines}\nالتوصيل: ${delivery.toFixed(3)} د.ك\nالمجموع: ${total.toFixed(3)} د.ك`
  )

  if (items.length === 0) {
    return (
      <div dir="rtl" className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-4">🛍️</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">سلتك فارغة</h1>
        <p className="text-gray-500 mb-8">أضف منتجات لتبدأ الطلب</p>
        <Link href="/products" className="bg-rose-500 hover:bg-rose-600 text-white font-medium px-6 py-3 rounded-xl transition-colors">
          تصفح المنتجات
        </Link>
      </div>
    )
  }

  return (
    <div dir="rtl" className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">سلة التسوق</h1>

      <div className="flex flex-col gap-4 mb-8">
        {items.map(item => (
          <div key={item.variantId} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
            <div className="text-3xl">
              {item.slug.startsWith('flower') ? '🌸' : '🚗'}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">{item.nameAr}</p>
              <p className="text-xs text-gray-400">{item.ageAr}</p>
              <p className="text-rose-500 font-bold mt-1">{(item.priceKwd * item.quantity).toFixed(3)} د.ك</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={() => removeItem(item.variantId)}
              className="text-gray-300 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>المجموع الفرعي</span>
          <span>{subtotal.toFixed(3)} د.ك</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mb-3">
          <span>التوصيل</span>
          <span>{delivery.toFixed(3)} د.ك</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-200 pt-3">
          <span>الإجمالي</span>
          <span>{total.toFixed(3)} د.ك</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Link
          href="/checkout"
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-4 rounded-2xl text-center transition-colors"
        >
          المتابعة للدفع
        </Link>
        <a
          href={`https://wa.me/96550499867?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full border-2 border-green-500 text-green-600 font-semibold py-3 rounded-2xl text-center hover:bg-green-50 transition-colors"
        >
          اطلب عبر واتساب
        </a>
        <button
          onClick={clearCart}
          className="text-sm text-gray-400 hover:text-gray-600 text-center py-2"
        >
          إفراغ السلة
        </button>
      </div>
    </div>
  )
}
