import { SiteHeader } from '@/components/shared/site-header'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <SiteHeader />
      <main>{children}</main>
    </div>
  )
}
