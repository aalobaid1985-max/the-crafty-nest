import Link from 'next/link'
import { CartIcon } from '@/components/shared/cart-icon'
import { LogoutButton } from '@/components/shared/logout-button'
import { createClient } from '@/lib/supabase/server'

export async function SiteHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{
        background: 'color-mix(in oklab, var(--bg) 88%, transparent)',
        backdropFilter: 'saturate(140%) blur(10px)',
        WebkitBackdropFilter: 'saturate(140%) blur(10px)',
        borderColor: 'var(--line)',
      }}
    >
      <div className="max-w-[1320px] mx-auto px-14 py-3.5 grid items-center gap-9" style={{ gridTemplateColumns: 'auto 1fr auto' }}>

        {/* Brand */}
        <Link href="/" className="inline-flex items-center gap-2.5" style={{ color: 'var(--ink)' }}>
          <span style={{ color: 'var(--accent)' }}>
            <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
              <ellipse cx="16" cy="20" rx="13" ry="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <ellipse cx="16" cy="17" rx="9"  ry="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <circle  cx="16" cy="14" r="2.4" fill="currentColor" />
            </svg>
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', lineHeight: 1, letterSpacing: '-0.01em' }}>
            <em style={{ fontStyle: 'italic', color: 'var(--muted)', fontSize: '0.78em', marginLeft: '2px' }}>the</em>{' '}
            crafty nest
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex gap-7 justify-self-center" style={{ fontSize: '13.5px' }}>
          {[
            { href: '/products', label: 'المنتجات' },
            { href: '/track',    label: 'تتبع طلبك' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="py-1.5 transition-opacity opacity-80 hover:opacity-100"
              style={{ color: 'var(--ink)', position: 'relative' }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <CartIcon />
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs hidden sm:block" style={{ color: 'var(--muted)' }} dir="ltr">
                {user.phone}
              </span>
              <LogoutButton
                className="text-xs px-4 py-2 rounded-full border transition-colors hover:border-[--ink]"
                style={{ borderColor: 'var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontSize: '13px' }}
              />
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border transition-colors hover:border-[--ink]"
              style={{ borderColor: 'var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontSize: '13px' }}
            >
              دخول
            </Link>
          )}
        </div>

      </div>
    </header>
  )
}
