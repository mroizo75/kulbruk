'use client'

import { useState, useEffect } from 'react'

interface PopularSearch {
  popularMakes: Array<{ make: string; count: number }>
  popularModels: Array<{ model: string; count: number }>
  popularLocations: Array<{ location: string; count: number }>
  popularSearches: string[]
  trendingTerms: Array<{ term: string; count: number }>
  totalCarListings: number
  lastUpdated: string
}

export function useCarSearch() {
  const [popularData, setPopularData] = useState<PopularSearch | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPopularSearches = async () => {
      try {
        const response = await fetch('/api/cars/popular-searches')
        if (response.ok) {
          const data = await response.json()
          setPopularData(data)
        } else {
          throw new Error('Feil ved henting av populære søk')
        }
      } catch (err) {
        console.error('Error fetching popular car searches:', err)
        setError(err instanceof Error ? err.message : 'Ukjent feil')
        
        // Fallback til lokale data
        setPopularData({
          popularMakes: [
            { make: 'Tesla', count: 30 },
            { make: 'BMW', count: 25 },
            { make: 'Audi', count: 20 },
            { make: 'Toyota', count: 18 },
            { make: 'Volkswagen', count: 15 }
          ],
          popularModels: [
            { model: 'Tesla Model 3', count: 15 },
            { model: 'BMW X5', count: 12 },
            { model: 'Audi A4', count: 10 },
            { model: 'Toyota RAV4', count: 8 }
          ],
          popularSearches: [
            'Tesla Model 3 Oslo',
            'BMW X5 diesel',
            'Audi A4 automat',
            'Toyota RAV4 hybrid',
            'Volkswagen Golf elbil',
            'Volvo XC60 Bergen'
          ],
          trendingTerms: [
            { term: 'elbil', count: 25 },
            { term: 'hybrid', count: 20 },
            { term: 'automat', count: 15 }
          ],
          popularLocations: [
            { location: 'Oslo', count: 40 },
            { location: 'Bergen', count: 25 },
            { location: 'Trondheim', count: 15 }
          ],
          totalCarListings: 0,
          lastUpdated: new Date().toISOString()
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPopularSearches()
  }, [])

  // Generer intelligente søkeforslag basert på input
  const generateSmartSuggestions = (input: string): string[] => {
    if (!popularData || !input || input.length < 2) {
      return popularData?.popularSearches.slice(0, 6) || []
    }

    const suggestions: string[] = []
    const lowerInput = input.toLowerCase()

    // Søk i populære merker
    popularData.popularMakes.forEach(({ make }) => {
      if (make.toLowerCase().includes(lowerInput)) {
        suggestions.push(make)
        // Legg til populære modeller for dette merket
        popularData.popularModels
          .filter(({ model }) => model.toLowerCase().startsWith(make.toLowerCase()))
          .slice(0, 2)
          .forEach(({ model }) => suggestions.push(model))
      }
    })

    // Søk i populære modeller
    popularData.popularModels.forEach(({ model }) => {
      if (model.toLowerCase().includes(lowerInput) && !suggestions.includes(model)) {
        suggestions.push(model)
      }
    })

    // Søk i populære lokasjoner
    popularData.popularLocations?.forEach(({ location }) => {
      if (location.toLowerCase().includes(lowerInput)) {
        suggestions.push(`Biler i ${location}`)
      }
    })

    // Søk i trending terms
    popularData.trendingTerms.forEach(({ term }) => {
      if (term.includes(lowerInput)) {
        // Kombiner med populære merker
        popularData.popularMakes.slice(0, 3).forEach(({ make }) => {
          suggestions.push(`${make} ${term}`)
        })
      }
    })

    // Kombiner med smart matching
    const smartCombinations = generateSmartCombinations(input, popularData)
    suggestions.push(...smartCombinations)

    return [...new Set(suggestions)].slice(0, 8) // Fjern duplikater og begrens
  }

  return {
    popularData,
    isLoading,
    error,
    generateSmartSuggestions
  }
}

// Helper function for smart combinations
function generateSmartCombinations(input: string, data: PopularSearch): string[] {
  const combinations: string[] = []
  const lowerInput = input.toLowerCase()

  // Smart matching patterns
  const patterns = [
    { keywords: ['billig', 'rimelig', 'under'], suggestions: ['under 200k', 'under 100k'] },
    { keywords: ['ny', 'nye', 'nyere'], suggestions: ['2020-2024', 'nye modeller'] },
    { keywords: ['familie', 'stor', 'plass'], suggestions: ['familiebil', 'stasjonsvogn', '7-seter'] },
    { keywords: ['sport', 'rask', 'kraftig'], suggestions: ['sportsbil', 'høy hk', 'turbo'] },
    { keywords: ['miljø', 'grønn', 'utslipp'], suggestions: ['elbil', 'hybrid', 'lav utslipp'] }
  ]

  patterns.forEach(({ keywords, suggestions }) => {
    if (keywords.some(keyword => lowerInput.includes(keyword))) {
      suggestions.forEach(suggestion => {
        // Kombiner med populære merker
        data.popularMakes.slice(0, 2).forEach(({ make }) => {
          combinations.push(`${make} ${suggestion}`)
        })
      })
    }
  })

  return combinations.slice(0, 3)
}
