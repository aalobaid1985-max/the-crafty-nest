import { SiteHeader } from '@/components/shared/site-header'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" dir="rtl" style={{ background: 'var(--bg)' }}>
      <SiteHeader />
      <main>{children}</main>
    </div>
  )
}
