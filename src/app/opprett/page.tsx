import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CreateListingForm from '@/components/create-listing-form'
import DashboardLayout from '@/components/dashboard-layout'

export default async function CreateListingPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/sign-in?redirectUrl=/opprett')
  }

  return (
    <DashboardLayout userRole="customer">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Legg ut ny annonse</h1>
          <p className="text-gray-600 mt-2">Fyll ut skjemaet under for å publisere din annonse.</p>
        </div>

        <CreateListingForm />
      </div>
    </DashboardLayout>
  )
}