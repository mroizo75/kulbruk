import { type Metadata, type Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import ConditionalNavbar from '@/components/conditional-navbar'
import ConditionalFooter from '@/components/conditional-footer'
import CookieConsent from '@/components/cookie-consent'
import SessionProvider from '@/components/session-provider'
import './globals.css'
import '@/sentry.client.config'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Kulbruk.no - Norges nye markedsplass',
  description: 'Kulbruk.no er et brukervennlig og profesjonelt markedsplass-alternativ hvor privatpersoner og bedrifter kan legge ut annonser til en rimelig pris.',
  keywords: ['markedsplass', 'salg', 'brukt', 'annonser', 'norge', 'bil', 'møbler', 'elektronikk'],
  openGraph: {
    title: 'Kulbruk.no - Norges nye markedsplass',
    description: 'Et brukervennlig og profesjonelt markedsplass-alternativ hvor privatpersoner og bedrifter kan legge ut annonser til en rimelig pris.',
    locale: 'nb_NO',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="no">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <ConditionalNavbar />
          <main className="min-h-screen">
            {children}
          </main>
          <ConditionalFooter />
          <Toaster position="top-right" richColors />
          <CookieConsent />
        </SessionProvider>
        {/* Inline minimal CSS fallback in case main CSS fails to load on enkelte mobilnettlesere */}
        <noscript>
          <link rel="stylesheet" href="/base-fallback.css" />
        </noscript>
      </body>
    </html>
  )
}