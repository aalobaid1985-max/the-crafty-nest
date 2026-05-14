import Link from 'next/link'
import { CartIcon } from '@/components/shared/cart-icon'
import { LogoutButton } from '@/components/shared/logout-button'
import { createClient } from '@/lib/supabase/server'

export async function SiteHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-rose-500">
          The Crafty Nest
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/products" className="text-sm text-gray-600 hover:text-gray-900">
            المنتجات
          </Link>
          <Link href="/track" className="text-sm text-gray-600 hover:text-gray-900">
            تتبع طلبك
          </Link>
          <CartIcon />
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 hidden sm:block" dir="ltr">{user.phone}</span>
              <LogoutButton className="text-sm text-gray-500 hover:text-gray-700" />
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl transition-colors"
            >
              دخول
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
