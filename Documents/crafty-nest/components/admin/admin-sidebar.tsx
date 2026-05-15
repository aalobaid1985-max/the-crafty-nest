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
    <aside
      className="w-52 flex flex-col min-h-screen sticky top-0"
      style={{ background: 'var(--surface)', borderLeft: '1px solid var(--line)' }}
    >
      <div className="p-5" style={{ borderBottom: '1px solid var(--line)' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--accent)', lineHeight: 1 }}>
          The Crafty Nest
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>لوحة الإدارة</p>
      </div>

      <nav className="flex flex-col gap-1 p-3 flex-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors"
              style={{
                background: active ? 'color-mix(in oklab, var(--accent) 10%, transparent)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--ink)',
                opacity: active ? 1 : 0.75,
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 flex flex-col gap-2" style={{ borderTop: '1px solid var(--line)' }}>
        <Link href="/" className="text-xs transition-colors" style={{ color: 'var(--muted)' }}>
          ← العودة للمتجر
        </Link>
        <LogoutButton className="text-xs text-right transition-colors" style={{ color: 'var(--muted)' } as React.CSSProperties} />
      </div>
    </aside>
  )
}
