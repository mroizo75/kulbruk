import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import ConditionalNavbar from '@/components/conditional-navbar'
import './globals.css'

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="no">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ConditionalNavbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}