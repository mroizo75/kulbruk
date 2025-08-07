import { redirect } from 'next/navigation'
import { getCategoryRedirect, isValidMainCategory } from '@/lib/category-mapper'
import CategoryListings from '@/components/category-listings'

interface PageProps {
  params: {
    category: string
  }
}

export default function CategoryPage({ params }: PageProps) {
  const { category } = params
  
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
