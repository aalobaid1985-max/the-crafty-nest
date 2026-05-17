import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Crafty Nest | ألعاب مغناطيسية تعليمية للأطفال',
  description: 'مجموعات تعليمية مغناطيسية للأطفال من عمر ٢ إلى ٨ سنوات — الكويت',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[--bg] text-[--ink] antialiased">
        {children}
      </body>
    </html>
  )
}
