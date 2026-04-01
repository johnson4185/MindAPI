import type { Metadata } from 'next'
import './globals.css'
import Shell from '@/components/layout/Shell'

export const metadata: Metadata = {
  title: 'MindAPI - Enterprise API Platform',
  description: 'Enterprise API publishing, governance, analytics, and developer access.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  )
}
