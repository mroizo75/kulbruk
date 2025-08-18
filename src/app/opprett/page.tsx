import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ListingWizard from '@/components/listing-wizard/listing-wizard'

export default async function CreateListingPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/sign-in?redirectUrl=/opprett')
  }

  return <ListingWizard />
}