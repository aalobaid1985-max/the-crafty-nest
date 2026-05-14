'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Package, BarChart3, Tag } from 'lucide-react'
import { LogoutButton } from '@/components/shared/logout-button'

const NAV = [
  { href: '/admin/dashboard',  label: 'الرئيسية',   icon: LayoutDashboard },
  { href: '/admin/orders',     label: 'الطلبات',     icon: ShoppingBag },
  { href: '/admin/inventory',  label: 'المخزون',     icon: Package },
  { href: '/admin/reports',    label: 'التقارير',    icon: BarChart3 },
  { href: '/admin/discounts',  label: 'الخصومات',   icon: Tag },
]

export function AdminSidebar() {
  const path = usePathname()

  return (
    <aside className="w-52 bg-white border-l border-gray-100 flex flex-col min-h-screen sticky top-0">
      <div className="p-5 border-b border-gray-100">
        <p className="font-bold text-rose-500 text-lg">The Crafty Nest</p>
        <p className="text-xs text-gray-400 mt-0.5">لوحة الإدارة</p>
      </div>
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              path.startsWith(href)
                ? 'bg-rose-50 text-rose-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
          ← العودة للمتجر
        </Link>
        <LogoutButton className="text-xs text-gray-400 hover:text-red-500 text-right" />
      </div>
    </aside>
  )
}
