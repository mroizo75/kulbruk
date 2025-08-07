import { prisma } from '@/lib/prisma'

export async function seedDatabase() {
  try {
    console.log('🌱 Starter database seeding...')

    // 1. Opprett kategorier
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: 'Bil' },
        update: {},
        create: { name: 'Bil', description: 'Biler og motoriserte kjøretøy' }
      }),
      prisma.category.upsert({
        where: { name: 'Eiendom' },
        update: {},
        create: { name: 'Eiendom', description: 'Leiligheter, hus og næringseiendommer' }
      }),
      prisma.category.upsert({
        where: { name: 'Elektronikk' },
        update: {},
        create: { name: 'Elektronikk', description: 'Mobiler, PC, TV og elektronikk' }
      }),
      prisma.category.upsert({
        where: { name: 'Møbler' },
        update: {},
        create: { name: 'Møbler', description: 'Møbler og interiør' }
      }),
      prisma.category.upsert({
        where: { name: 'Klær' },
        update: {},
        create: { name: 'Klær', description: 'Klær og tilbehør' }
      }),
      prisma.category.upsert({
        where: { name: 'Sport' },
        update: {},
        create: { name: 'Sport', description: 'Sportsartikler og utstyr' }
      })
    ])

    console.log('✅ Kategorier opprettet:', categories.length)

    // 2. Opprett testbrukere (kun hvis de ikke finnes)
    const testUsers = [
      {
        clerkId: 'user_test_1',
        email: 'lars@test.no',
        firstName: 'Lars',
        lastName: 'Andersen',
        role: 'customer'
      },
      {
        clerkId: 'user_test_2',
        email: 'maria@test.no',
        firstName: 'Maria',
        lastName: 'Johansen',
        role: 'customer'
      },
      {
        clerkId: 'user_test_3',
        email: 'erik@business.no',
        firstName: 'Erik',
        lastName: 'Svendsen',
        role: 'business',
        companyName: 'Svendsen Bil AS',
        orgNumber: '123456789'
      },
      {
        clerkId: 'user_test_4',
        email: 'admin@kulbruk.no',
        firstName: 'Admin',
        lastName: 'Kulbruk',
        role: 'admin'
      }
    ]

    const users = []
    for (const userData of testUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { clerkId: userData.clerkId }
      })
      
      if (!existingUser) {
        const user = await prisma.user.create({ data: userData })
        users.push(user)
      } else {
        users.push(existingUser)
      }
    }

    console.log('✅ Testbrukere opprettet/hentet:', users.length)

    // 3. Opprett testannonser
    const bilCategory = categories.find(c => c.name === 'Bil')!
    const eiendomCategory = categories.find(c => c.name === 'Eiendom')!
    const elektronikkCategory = categories.find(c => c.name === 'Elektronikk')!
    const møblerCategory = categories.find(c => c.name === 'Møbler')!

    const sampleListings = [
      // Biler
      {
        title: '2020 BMW X5 xDrive40i',
        description: 'Velholdt BMW X5 med full servicehistorikk. Kun 45 000 km. Automat, diesel, panoramatak.',
        price: 465000,
        categoryId: bilCategory.id,
        userId: users[0].id,
        location: 'Oslo',
        status: 'APPROVED',
        contactName: 'Lars Andersen',
        contactEmail: 'lars@test.no',
        contactPhone: '90123456',
        images: ['https://via.placeholder.com/600x400?text=BMW+X5'],
        make: 'BMW',
        model: 'X5',
        year: 2020,
        registrationNumber: 'AB12345',
        mileage: 45000,
        listingType: 'AUCTION'
      },
      {
        title: '2018 Audi A4 Avant',
        description: 'Praktisk stasjonsvogn i perfekt stand. Quattro firehjulstrekk.',
        price: 325000,
        categoryId: bilCategory.id,
        userId: users[1].id,
        location: 'Bergen',
        status: 'APPROVED',
        contactName: 'Maria Johansen',
        contactEmail: 'maria@test.no',
        contactPhone: '90234567',
        images: ['https://via.placeholder.com/600x400?text=Audi+A4'],
        make: 'Audi',
        model: 'A4',
        year: 2018,
        mileage: 78000,
        listingType: 'FIXED_PRICE'
      },
      {
        title: '2019 Tesla Model 3',
        description: 'Elektrisk luksus med autopilot. Lange rekkevidde og superladning.',
        price: 385000,
        categoryId: bilCategory.id,
        userId: users[0].id,
        location: 'Trondheim',
        status: 'APPROVED',
        contactName: 'Lars Andersen',
        contactEmail: 'lars@test.no',
        contactPhone: '90123456',
        images: ['https://via.placeholder.com/600x400?text=Tesla+Model+3'],
        make: 'Tesla',
        model: 'Model 3',
        year: 2019,
        mileage: 52000,
        listingType: 'AUCTION'
      },

      // Eiendom
      {
        title: '3-roms leilighet på Majorstuen',
        description: 'Lys og luftig leilighet i 4. etasje. Nyoppusset kjøkken og bad. Balkong med utsikt.',
        price: 4200000,
        categoryId: eiendomCategory.id,
        userId: users[1].id,
        location: 'Oslo',
        status: 'APPROVED',
        contactName: 'Maria Johansen',
        contactEmail: 'maria@test.no',
        contactPhone: '90234567',
        images: ['https://via.placeholder.com/600x400?text=Majorstuen+leilighet'],
        listingType: 'FIXED_PRICE'
      },
      {
        title: 'Enebolig med hage i Stavanger',
        description: 'Romslig enebolig på 180 kvm med stor hage. 4 soverom, 2 bad, garasje.',
        price: 3850000,
        categoryId: eiendomCategory.id,
        userId: users[0].id,
        location: 'Stavanger',
        status: 'APPROVED',
        contactName: 'Lars Andersen',
        contactEmail: 'lars@test.no',
        contactPhone: '90123456',
        images: ['https://via.placeholder.com/600x400?text=Stavanger+enebolig'],
        listingType: 'FIXED_PRICE'
      },

      // Elektronikk
      {
        title: 'iPhone 14 Pro Max 256GB',
        description: 'Som ny iPhone 14 Pro Max i Deep Purple. Kun 3 måneder gammel.',
        price: 12999,
        categoryId: elektronikkCategory.id,
        userId: users[1].id,
        location: 'Bergen',
        status: 'APPROVED',
        contactName: 'Maria Johansen',
        contactEmail: 'maria@test.no',
        contactPhone: '90234567',
        images: ['https://via.placeholder.com/600x400?text=iPhone+14+Pro'],
        listingType: 'FIXED_PRICE'
      },
      {
        title: 'MacBook Pro 16" M2 Max',
        description: 'Kraftig MacBook Pro for profesjonell bruk. 32GB RAM, 1TB SSD.',
        price: 28999,
        categoryId: elektronikkCategory.id,
        userId: users[0].id,
        location: 'Oslo',
        status: 'APPROVED',
        contactName: 'Lars Andersen',
        contactEmail: 'lars@test.no',
        contactPhone: '90123456',
        images: ['https://via.placeholder.com/600x400?text=MacBook+Pro'],
        listingType: 'FIXED_PRICE'
      },

      // Møbler
      {
        title: 'Vintage skinnsofa fra 1960-tallet',
        description: 'Klassisk Chesterfield-stil i ekte skinn. Nyrestaurert og i perfekt stand.',
        price: 15999,
        categoryId: møblerCategory.id,
        userId: users[1].id,
        location: 'Oslo',
        status: 'APPROVED',
        contactName: 'Maria Johansen',
        contactEmail: 'maria@test.no',
        contactPhone: '90234567',
        images: ['https://via.placeholder.com/600x400?text=Vintage+sofa'],
        listingType: 'FIXED_PRICE'
      }
    ]

    // Opprett annonser
    const listings = []
    for (const listingData of sampleListings) {
      const existingListing = await prisma.listing.findFirst({
        where: { 
          title: listingData.title,
          userId: listingData.userId
        }
      })

      if (!existingListing) {
        const listing = await prisma.listing.create({ data: listingData })
        listings.push(listing)

        // Opprett auksjon for bil-annonser med auction type
        if (listingData.listingType === 'AUCTION' && listingData.categoryId === bilCategory.id) {
          await prisma.auction.create({
            data: {
              listingId: listing.id,
              startDate: new Date(),
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dager frem
              reservePrice: listingData.price,
              currentHighestBid: Math.floor(listingData.price * 0.7),
              status: 'ACTIVE'
            }
          })

          // Opprett prisestimering
          await prisma.priceEstimation.create({
            data: {
              listingId: listing.id,
              estimatedValue: listingData.price,
              confidence: 92,
              method: 'ML_ALGORITHM',
              factors: {
                make: listingData.make,
                model: listingData.model,
                year: listingData.year,
                mileage: listingData.mileage,
                condition: 'Meget god',
                marketTrend: 'Stabil'
              }
            }
          })
        }
      } else {
        listings.push(existingListing)
      }
    }

    console.log('✅ Testannonser opprettet/hentet:', listings.length)

    // 4. Opprett noen testbud for auksjoner
    const auctions = await prisma.auction.findMany({
      where: { status: 'ACTIVE' }
    })

    const businessUser = users.find(u => u.role === 'business')
    if (businessUser && auctions.length > 0) {
      for (const auction of auctions.slice(0, 2)) {
        const existingBid = await prisma.bid.findFirst({
          where: {
            auctionId: auction.id,
            userId: businessUser.id
          }
        })

        if (!existingBid) {
          await prisma.bid.create({
            data: {
              auctionId: auction.id,
              userId: businessUser.id,
              amount: auction.currentHighestBid || 0,
              status: 'ACTIVE'
            }
          })
        }
      }
      console.log('✅ Testbud opprettet for auksjoner')
    }

    console.log('🎉 Database seeding fullført!')
    
    return {
      categories: categories.length,
      users: users.length,
      listings: listings.length,
      auctions: auctions.length
    }

  } catch (error) {
    console.error('❌ Feil under database seeding:', error)
    throw error
  }
}
