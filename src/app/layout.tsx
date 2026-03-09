import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth/context'

export const metadata: Metadata = {
  title: 'Container Theatre v1.0 | No bugs. Just blockbusters.',
  description: 'Nagercoil\'s First Private Mini Theatre. Book your private screening experience - couples, birthdays, celebrations, and more.',
  keywords: ['container theatre', 'private theatre', 'nagercoil', 'mini theatre', 'private screening', 'birthday venue'],
  authors: [{ name: 'Container Theatre v1.0' }],
  openGraph: {
    title: 'Container Theatre v1.0',
    description: 'No bugs. Just blockbusters. Book your private theatre experience.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-terminal-black min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
