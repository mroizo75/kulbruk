import { type Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCategoryRedirect, isValidMainCategory } from '@/lib/category-mapper'
import CategoryListings from '@/components/category-listings'

interface PageProps {
  params: Promise<{
    category: string
  }>
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params
  
  // Sjekk om kategorien er gyldig
  if (!isValidMainCategory(category)) {
    // Prøv å finne redirect
    const redirectUrl = getCategoryRedirect(category)
    if (redirectUrl) {
      redirect(redirectUrl)
    } else {
      // Redirect til hovedsiden for annonser hvis ingen match
      redirect('/annonser')
    }
  }
  
  return (
    <CategoryListings category={category} />
  )
}

// Generer statiske ruter for de 3 hovedkategoriene
export function generateStaticParams() {
  return [
    { category: 'bil' },
    { category: 'eiendom' },
    { category: 'torget' }
  ]
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const map: Record<string, { title: string; description: string }> = {
    bil: {
      title: 'Biler til salgs – Kulbruk',
      description: 'Finn brukte biler til salgs. Søk, filtrer og sammenlign priser for å finne riktig bil.',
    },
    eiendom: {
      title: 'Eiendom til salgs – Kulbruk',
      description: 'Se boliger og eiendom til salgs. Filtrer etter område, pris og størrelse.',
    },
    torget: {
      title: 'Torget – Kjøp og salg – Kulbruk',
      description: 'Oppdag brukte varer i alle kategorier. Finn gode kjøp i nærheten av deg.',
    },
  }
  const fallback = { title: 'Annonser – Kulbruk', description: 'Bla gjennom annonser på Kulbruk.' }
  const meta = map[category] || fallback
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/annonser/${category}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
    },
  }
}
