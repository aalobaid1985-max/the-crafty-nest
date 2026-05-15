import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Crafty Nest | ألعاب مغناطيسية تعليمية للأطفال',
  description: 'مجموعات تعليمية مغناطيسية للأطفال من عمر ٢ إلى ٨ سنوات — الكويت',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body className="min-h-full flex flex-col bg-[--bg] text-[--ink] antialiased">
        {children}
      </body>
    </html>
  )
}
