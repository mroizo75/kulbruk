import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import EditListingForm from '@/components/edit-listing-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditListingPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/sign-in?callbackUrl=/dashboard/customer/annonser')

  const { id } = await params
  const userId = (session.user as any).id as string

  // Hent annonsen og verifiser eierskap
  const listing = await prisma.listing.findFirst({
    where: { id, userId },
    include: { images: true, category: true, vehicleSpec: true },
  })

  if (!listing) {
    notFound()
  }

  return (
    <DashboardLayout userRole="customer">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Rediger annonse</h1>
        <EditListingForm
          id={listing.id}
          title={listing.title}
          description={listing.description}
          price={Number(listing.price)}
          location={listing.location}
          contactName={listing.contactName || ''}
          contactEmail={listing.contactEmail || ''}
          contactPhone={listing.contactPhone || ''}
          showAddress={!!listing.showAddress}
          isActive={!!listing.isActive}
          shortCode={listing.shortCode || undefined}
          images={listing.images.map((img) => ({ url: img.url }))}
          vehicleSpec={listing.vehicleSpec || undefined}
          listingType={listing.listingType as any}
        />
      </div>
    </DashboardLayout>
  )
}


