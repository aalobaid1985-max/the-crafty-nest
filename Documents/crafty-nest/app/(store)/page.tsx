import Link from 'next/link'

const PRODUCTS = [
  { slug: 'flower-shop-2-4', nameAr: 'باقة محل الورد', ageAr: '٢-٤ سنوات', price: '9.500', theme: 'flower', color: 'bg-rose-50 border-rose-200', emoji: '🌸' },
  { slug: 'flower-shop-4-6', nameAr: 'باقة محل الورد', ageAr: '٤-٦ سنوات', price: '9.500', theme: 'flower', color: 'bg-rose-50 border-rose-200', emoji: '🌸' },
  { slug: 'flower-shop-6-8', nameAr: 'باقة محل الورد', ageAr: '٦-٨ سنوات', price: '9.500', theme: 'flower', color: 'bg-rose-50 border-rose-200', emoji: '🌸' },
  { slug: 'car-shop-2-4',    nameAr: 'باقة محل السيارات', ageAr: '٢-٤ سنوات', price: '9.500', theme: 'car', color: 'bg-sky-50 border-sky-200', emoji: '🚗' },
  { slug: 'car-shop-4-6',    nameAr: 'باقة محل السيارات', ageAr: '٤-٦ سنوات', price: '9.500', theme: 'car', color: 'bg-sky-50 border-sky-200', emoji: '🚗' },
  { slug: 'car-shop-6-8',    nameAr: 'باقة محل السيارات', ageAr: '٦-٨ سنوات', price: '9.500', theme: 'car', color: 'bg-sky-50 border-sky-200', emoji: '🚗' },
]

export default function HomePage() {
  return (
    <div dir="rtl">

      {/* Hero */}
      <section className="bg-gradient-to-br from-rose-50 to-amber-50 py-20 px-4 text-center">
        <p className="text-rose-500 font-medium text-sm mb-3">ألعاب مغناطيسية تعليمية • الكويت</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          العب، تعلّم، وابتكر
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
          باقات مغناطيسية تعليمية للأطفال من عمر ٢ إلى ٨ سنوات — بثيمة محل الورد ومحل السيارات
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/products" className="bg-rose-500 hover:bg-rose-600 text-white font-medium px-6 py-3 rounded-xl transition-colors">
            تسوق الآن
          </Link>
          <a
            href="https://wa.me/96550499867"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            اطلب عبر واتساب
          </a>
        </div>
      </section>

      {/* Products grid */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">منتجاتنا</h2>
        <p className="text-gray-500 text-center mb-8">جميع الباقات بسعر <span className="font-bold text-gray-800">٩.٥٠٠ د.ك</span></p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRODUCTS.map(p => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              className={`${p.color} border rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col gap-3`}
            >
              <div className="text-4xl">{p.emoji}</div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{p.nameAr}</p>
                <p className="text-gray-500 text-sm">{p.ageAr}</p>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <span className="font-bold text-gray-900">٩.٥٠٠ د.ك</span>
                <span className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full">
                  أضف للسلة
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Age guide */}
      <section className="bg-white py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">كيف تختار الباقة المناسبة؟</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { age: '٢ – ٤ سنوات', desc: 'مطابقة الظلال، الألوان، والأشكال. مناسب للبدايات الأولى.', skills: 'الحركة الدقيقة • الألوان • الأرقام' },
              { age: '٤ – ٦ سنوات', desc: 'اكتشاف الفروق، تركيب الصور، وتطوير الذاكرة.', skills: 'حل المشكلات • الذاكرة • الألوان' },
              { age: '٦ – ٨ سنوات', desc: 'محلي الصغير الكامل مع واجهة المحل والعملات للعب.', skills: 'القراءة • الحساب • ريادة الأعمال' },
            ].map(({ age, desc, skills }) => (
              <div key={age} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                <p className="text-xl font-bold text-gray-800 mb-2">{age}</p>
                <p className="text-sm text-gray-600 mb-3">{desc}</p>
                <p className="text-xs text-rose-500 font-medium">{skills}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="bg-gradient-to-br from-rose-50 to-amber-50 py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🧲', title: 'مغناطيسية آمنة', desc: 'مواد مجتازة ومعتمدة' },
              { icon: '👨‍👩‍👧', title: 'تفاعلية', desc: 'للعب المشترك مع الأهل' },
              { icon: '🚚', title: 'توصيل لكل الكويت', desc: '١.٥٠٠ د.ك فقط' },
              { icon: '💬', title: 'واتساب', desc: 'اطلب بسهولة' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="p-4">
                <div className="text-4xl mb-3">{icon}</div>
                <p className="font-semibold text-gray-800 mb-1">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact strip */}
      <section className="bg-white border-t border-gray-100 py-8 px-4 text-center">
        <p className="text-gray-500 text-sm mb-3">للاستفسار والطلبات</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="https://wa.me/96550499867" target="_blank" rel="noopener noreferrer"
            className="text-green-600 font-medium text-sm hover:underline">
            واتساب: 50499867
          </a>
          <span className="text-gray-300">|</span>
          <a href="https://instagram.com/thecraftynest.kw" target="_blank" rel="noopener noreferrer"
            className="text-rose-500 font-medium text-sm hover:underline">
            @thecraftynest.kw
          </a>
          <span className="text-gray-300">|</span>
          <a href="mailto:thecraftynest.kw@gmail.com"
            className="text-gray-500 font-medium text-sm hover:underline">
            thecraftynest.kw@gmail.com
          </a>
        </div>
      </section>

    </div>
  )
}
