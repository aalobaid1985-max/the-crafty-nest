import Link from 'next/link'

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams

  const whatsappText = encodeURIComponent(`مرحبا، أود تأكيد طلبي رقم: ${order ?? ''}`)

  return (
    <div dir="rtl" className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">تم استلام طلبك!</h1>

      {order && (
        <p className="text-gray-500 mb-2">
          رقم الطلب: <span className="font-bold text-gray-800">{order}</span>
        </p>
      )}

      <p className="text-gray-500 text-sm mb-8">
        سنتواصل معك قريباً لتأكيد الطلب وتحديد موعد التوصيل
      </p>

      <div className="flex flex-col gap-3">
        <a
          href={`https://wa.me/96550499867?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          تواصل معنا على واتساب
        </a>
        <Link
          href="/products"
          className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          متابعة التسوق
        </Link>
      </div>
    </div>
  )
}
