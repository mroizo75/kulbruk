import { auth } from "@/lib/auth-edge"
import { NextRequest, NextResponse } from 'next/server'
import { getCategoryRedirect } from './lib/category-mapper'

// Ruter som krever autentisering
const protectedRoutes = [
  '/dashboard',
  '/opprett',
  '/complete-business-setup'
]

export default auth((req) => {
  // Håndter kategori-redirects først
  const categoryRedirect = handleCategoryRedirects(req)
  if (categoryRedirect) {
    return categoryRedirect
  }

  // Beskytt ruter manuelt: hvis match på protectedRoutes og ikke session -> redirect
  const isProtected = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
  // @ts-expect-error: auth wrapper legger session på request
  const session = req.auth
  if (isProtected && !session?.user) {
    const url = new URL('/sign-in', req.nextUrl)
    url.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

function handleCategoryRedirects(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl
  
  // Sjekk om det er en kategori-rute som ikke er hovedkategori
  const categoryMatch = pathname.match(/^\/annonser\/([^\/]+)$/)
  if (categoryMatch) {
    const category = categoryMatch[1]
    
    // Sjekk om det er en gyldig hovedkategori
    const validCategories = ['bil', 'eiendom', 'torget']
    if (!validCategories.includes(category)) {
      const redirectUrl = getCategoryRedirect(category)
      if (redirectUrl) {
        // Preservér query parameters
        const searchParams = req.nextUrl.searchParams.toString()
        const fullRedirectUrl = redirectUrl + (searchParams ? `?${searchParams}` : '')
        return NextResponse.redirect(new URL(fullRedirectUrl, req.url))
      } else {
        // Redirect til hovedsiden for annonser
        return NextResponse.redirect(new URL('/annonser', req.url))
      }
    }
  }
  
  // Håndter gamle kategori-ruter med /kategori/ prefix
  const oldCategoryMatch = pathname.match(/^\/annonser\/kategori\/([^\/]+)$/)
  if (oldCategoryMatch) {
    const category = oldCategoryMatch[1]
    const redirectUrl = getCategoryRedirect(category)
    if (redirectUrl) {
      const searchParams = req.nextUrl.searchParams.toString()
      const fullRedirectUrl = redirectUrl + (searchParams ? `?${searchParams}` : '')
      return NextResponse.redirect(new URL(fullRedirectUrl, req.url))
    } else {
      return NextResponse.redirect(new URL('/annonser', req.url))
    }
  }
  
  return null
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}