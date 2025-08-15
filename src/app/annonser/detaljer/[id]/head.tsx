import { prisma } from '@/lib/prisma'

export default async function Head({ params }: { params: { id: string } }) {
  const id = (await params).id
  const listing = await prisma.listing.findFirst({
    where: { OR: [{ id }, { shortCode: id }] },
    select: { title: true, description: true, images: { select: { url: true }, take: 1 }, price: true, location: true, createdAt: true },
  })
  const title = listing?.title ? `${listing.title} – Kulbruk` : 'Annonse – Kulbruk'
  const description = listing?.description?.slice(0, 160) || 'Se annonse på Kulbruk.'
  const ogImage = listing?.images?.[0]?.url || '/logo.png'

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="canonical" href={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/annonser/detaljer/${id}`} />
      {/* Product structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: listing?.title,
        description,
        image: ogImage,
        offers: listing?.price ? {
          '@type': 'Offer',
          priceCurrency: 'NOK',
          price: Number(listing.price),
          availability: 'https://schema.org/InStock',
          url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/annonser/detaljer/${id}`,
        } : undefined,
        areaServed: 'NO',
        url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/annonser/detaljer/${id}`,
      }) }} />
    </>
  )
}

