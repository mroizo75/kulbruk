import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.kulbruk.no'
  return {
    rules: [
      { userAgent: '*', allow: ['/' ], disallow: ['/api/', '/debug', '/dashboard'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}

