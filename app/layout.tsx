import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bộ Đếm Pomodoro - Tập Trung Cao Độ',
  description: 'Ứng dụng Pomodoro giúp bạn tập trung làm việc hiệu quả',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: Arial, sans-serif;
  --font-sans: Arial, sans-serif;
  --font-mono: 'Courier New', monospace;
}
        `}</style>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
