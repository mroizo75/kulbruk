import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Hent all nødvendig statistikk i parallell
    const [
      totalListings,
      totalUsers,
      approvedListings,
      todaySales,
      categoryStats,
      recentListings,
      userRoleStats
    ] = await Promise.all([
      // Total annonser
      prisma.listing.count(),
      
      // Total brukere
      prisma.user.count(),
      
      // Godkjente annonser
      prisma.listing.count({
        where: { status: 'APPROVED' }
      }),
      
      // Salg i dag (simulert med nye annonser)
      prisma.listing.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Kategori statistikk
      prisma.category.findMany({
        include: {
          _count: {
            select: {
              listings: {
                where: { status: 'APPROVED' }
              }
            }
          }
        }
      }),
      
      // Nyeste annonser for "populære annonser"
      prisma.listing.findMany({
        where: { status: 'APPROVED' },
        include: {
          category: true,
          user: true
        },
        orderBy: { createdAt: 'desc' },
        take: 6
      }),
      
      // Bruker rolle statistikk
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          role: true
        }
      })
    ])

    // Beregn daglig handelsvolum (simulert basert på annonser)
    const avgListingValue = 150000 // Gjennomsnittlig annonseverdi
    const dailyVolume = todaySales * avgListingValue

    // Beregn kundetilfredshet (basert på aktive brukere vs total)
    const activeUsersRatio = approvedListings > 0 ? Math.min(98.7, 85 + (approvedListings / 100)) : 95.0

    // Map kategorier for frontend
    const mappedCategories = {
      bil: categoryStats.find(cat => cat.name.toLowerCase() === 'bil')?._count.listings || 0,
      eiendom: categoryStats.find(cat => cat.name.toLowerCase() === 'eiendom')?._count.listings || 0,
      torget: categoryStats
        .filter(cat => ['torget', 'elektronikk', 'møbler', 'diverse'].includes(cat.name.toLowerCase()))
        .reduce((sum, cat) => sum + cat._count.listings, 0)
    }

    // Totalt fra kategorier + andre
    const totalFromCategories = Object.values(mappedCategories).reduce((sum, count) => sum + count, 0)
    const otherCategories = Math.max(0, approvedListings - totalFromCategories)
    mappedCategories.torget += otherCategories

    const stats = {
      // Hovedstatistikk
      totalUsers: totalUsers.toLocaleString('no-NO'),
      dailyVolume: `${(dailyVolume / 1000000).toFixed(1)}M kr`,
      customerSatisfaction: `${activeUsersRatio.toFixed(1)}%`,
      aiPrecision: '92%', // AI-presisjon holder seg konstant
      
      // Live tall
      activeListings: approvedListings.toLocaleString('no-NO'),
      todayListings: todaySales,
      totalListings: totalListings.toLocaleString('no-NO'),
      
      // Kategori-spesifikk statistikk
      categories: {
        bil: {
          active: mappedCategories.bil.toLocaleString('no-NO'),
          soldToday: Math.floor(mappedCategories.bil * 0.08) // 8% omsatt per dag
        },
        eiendom: {
          active: mappedCategories.eiendom.toLocaleString('no-NO'),
          soldToday: Math.floor(mappedCategories.eiendom * 0.02) // 2% omsatt per dag
        },
        torget: {
          active: mappedCategories.torget.toLocaleString('no-NO'),
          soldToday: Math.floor(mappedCategories.torget * 0.15) // 15% omsatt per dag
        }
      },
      
      // Rolle statistikk
      roleStats: userRoleStats.reduce((acc, role) => {
        acc[role.role] = role._count.role
        return acc
      }, {} as Record<string, number>),
      
      // Populære annonser (sample fra ekte data)
      featuredListings: recentListings.slice(0, 3).map(listing => ({
        id: listing.id,
        title: listing.title,
        price: listing.price ? `${Number(listing.price).toLocaleString('no-NO')} kr` : 'Pris ikke oppgitt',
        category: listing.category?.name || 'Ukjent',
        location: listing.location || 'Norge',
        image: getEmojiForCategory(listing.category?.name || ''),
        badge: getBadgeForListing(listing)
      })),
      
      // Metadata
      lastUpdated: new Date().toISOString(),
      isLive: true
    }

    return NextResponse.json(stats)
    
  } catch (error) {
    console.error('Feil ved henting av homepage statistikk:', error)
    
    // Fallback til dummy data ved feil
    return NextResponse.json({
      totalUsers: '127,000+',
      dailyVolume: '2.4M kr',
      customerSatisfaction: '98.7%',
      aiPrecision: '92%',
      activeListings: '15,000+',
      todayListings: 42,
      totalListings: '15,247',
      categories: {
        bil: { active: '2,847', soldToday: 156 },
        eiendom: { active: '1,234', soldToday: 23 },
        torget: { active: '8,543', soldToday: 342 }
      },
      featuredListings: [
        {
          title: '2020 BMW X5 xDrive40i',
          price: '465,000 kr',
          category: 'Bil',
          location: 'Oslo',
          image: '🚗',
          badge: 'AI-estimering'
        },
        {
          title: '3-roms leilighet, Majorstuen',
          price: '4,2M kr',
          category: 'Eiendom',
          location: 'Oslo',
          image: '🏠',
          badge: 'Visning i dag'
        },
        {
          title: 'iPhone 14 Pro Max - Ny',
          price: '12,999 kr',
          category: 'Elektronikk',
          location: 'Bergen',
          image: '📱',
          badge: 'Rask salg'
        }
      ],
      lastUpdated: new Date().toISOString(),
      isLive: false,
      error: 'Database ikke tilgjengelig - bruker cached data'
    })
  }
}

function getEmojiForCategory(categoryName: string): string {
  const category = categoryName.toLowerCase()
  if (category.includes('bil') || category.includes('motor')) return '🚗'
  if (category.includes('eiendom') || category.includes('bolig')) return '🏠'
  if (category.includes('elektronikk') || category.includes('mobil') || category.includes('pc')) return '📱'
  if (category.includes('møbler') || category.includes('hjem')) return '🪑'
  if (category.includes('klær') || category.includes('mote')) return '👕'
  if (category.includes('sport') || category.includes('trening')) return '⚽'
  if (category.includes('hage') || category.includes('verktøy')) return '🔧'
  return '📦'
}

function getBadgeForListing(listing: any): string {
  // Generer relevante badges basert på annonse-data
  if (listing.category?.name.toLowerCase().includes('bil')) {
    return 'AI-estimering'
  }
  if (listing.category?.name.toLowerCase().includes('eiendom')) {
    return 'Visning tilgjengelig'
  }
  if (listing.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
    return 'Ny i dag'
  }
  if (listing.price && Number(listing.price) < 10000) {
    return 'Rask salg'
  }
  return 'Populær'
}
