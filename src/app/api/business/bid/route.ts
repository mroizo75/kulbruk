import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    const user = await currentUser()
    
    if (!userId && !user) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    // Sjekk at brukeren er business
    const businessUser = await prisma.user.findUnique({
      where: { clerkId: user?.id || userId },
      select: { 
        id: true, 
        role: true, 
        companyName: true,
        email: true 
      }
    })

    if (!businessUser || businessUser.role !== 'business') {
      return NextResponse.json(
        { error: 'Kun bedrifter kan gi bud' },
        { status: 403 }
      )
    }

    const { auctionId, amount, message } = await request.json()

    // Valider input
    if (!auctionId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Ugyldig bud-informasjon' },
        { status: 400 }
      )
    }

    // Sjekk at annonsen eksisterer og er til auksjon
    const listing = await prisma.listing.findUnique({
      where: { id: auctionId },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        },
        bids: {
          where: { status: 'ACTIVE' },
          orderBy: { amount: 'desc' },
          take: 1
        }
      }
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonse ikke funnet' },
        { status: 404 }
      )
    }

    if (listing.status !== 'APPROVED' || listing.listingType !== 'AUCTION') {
      return NextResponse.json(
        { error: 'Denne annonsen er ikke tilgjengelig for bud' },
        { status: 400 }
      )
    }

    // Sjekk at budet er høyt nok
    const currentHighestBid = listing.bids[0]?.amount || 0
    const minimumBid = currentHighestBid + 5000 // Minimum 5000 kr over

    if (amount < minimumBid) {
      return NextResponse.json(
        { error: `Budet må være minst ${minimumBid.toLocaleString('no-NO')} kr` },
        { status: 400 }
      )
    }

    // Sjekk at bedriften ikke byr på egen annonse
    if (listing.userId === businessUser.id) {
      return NextResponse.json(
        { error: 'Du kan ikke by på dine egne annonser' },
        { status: 400 }
      )
    }

    // Deaktiver tidligere bud fra samme bedrift på samme annonse
    await prisma.bid.updateMany({
      where: {
        listingId: auctionId,
        bidderId: businessUser.id,
        status: 'ACTIVE'
      },
      data: { status: 'WITHDRAWN' }
    })

    // Opprett nytt bud
    const bid = await prisma.bid.create({
      data: {
        listingId: auctionId,
        bidderId: businessUser.id,
        amount: parseFloat(amount.toString()),
        message: message || null,
        status: 'ACTIVE'
      },
      include: {
        bidder: {
          select: { companyName: true, email: true }
        },
        listing: {
          select: { title: true }
        }
      }
    })

    // TODO: Send notifikasjon til annonse-eier om nytt bud
    console.log('Nytt bud mottatt:', {
      listingTitle: listing.title,
      bidder: businessUser.companyName,
      amount: amount,
      previousBid: currentHighestBid
    })

    // TODO: Send e-post til selger om nytt bud

    return NextResponse.json({
      success: true,
      message: 'Bud sendt vellykket!',
      bid: {
        id: bid.id,
        amount: bid.amount,
        listingTitle: listing.title,
        bidderCompany: businessUser.companyName
      }
    })

  } catch (error) {
    console.error('Feil ved bud-sending:', error)
    return NextResponse.json(
      { error: 'Kunne ikke sende bud' },
      { status: 500 }
    )
  }
}

// GET - Hent bud for en spesifikk annonse eller bedrift
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    const user = await currentUser()
    
    if (!userId && !user) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')
    const myBids = searchParams.get('myBids') === 'true'

    if (myBids) {
      // Hent alle bud fra denne bedriften
      const businessUser = await prisma.user.findUnique({
        where: { clerkId: user?.id || userId },
        select: { id: true, role: true }
      })

      if (!businessUser || businessUser.role !== 'business') {
        return NextResponse.json(
          { error: 'Kun bedrifter kan se bud' },
          { status: 403 }
        )
      }

      const bids = await prisma.bid.findMany({
        where: { 
          bidderId: businessUser.id,
          status: 'ACTIVE'
        },
        include: {
          listing: {
            select: { 
              id: true,
              title: true, 
              status: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({
        success: true,
        bids
      })
    }

    if (listingId) {
      // Hent alle bud for en spesifikk annonse
      const bids = await prisma.bid.findMany({
        where: { 
          listingId,
          status: 'ACTIVE'
        },
        include: {
          bidder: {
            select: { companyName: true }
          }
        },
        orderBy: { amount: 'desc' }
      })

      return NextResponse.json({
        success: true,
        bids
      })
    }

    return NextResponse.json(
      { error: 'Mangler parametere' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Feil ved henting av bud:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente bud' },
      { status: 500 }
    )
  }
}
