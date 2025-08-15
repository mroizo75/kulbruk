import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.kulbruk.no'

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/annonser',
    '/kontakt-oss',
    '/om-kulbruk',
    '/vilkar-og-betingelser',
    '/personvern',
  ].map((p) => ({ url: `${base}${p}`, changeFrequency: 'weekly', priority: 0.7 }))

  const listings = await prisma.listing.findMany({
    where: { status: 'APPROVED', isActive: true },
    select: { id: true, updatedAt: true },
    take: 5000,
    orderBy: { updatedAt: 'desc' },
  })

  const listingRoutes: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${base}/annonser/detaljer/${l.id}`,
    lastModified: l.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [...staticRoutes, ...listingRoutes]
}

