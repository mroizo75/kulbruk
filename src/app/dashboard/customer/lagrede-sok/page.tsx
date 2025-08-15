import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/dashboard-layout'
import SavedSearchRow from '@/components/saved-search-row'

export default async function SavedSearchesPage() {
  const session = await auth()
  if (!session?.user) redirect('/sign-in?callbackUrl=/dashboard/customer/lagrede-sok')
  const userId = (session.user as any).id as string
  const saved = await prisma.savedSearch.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })

  return (
    <DashboardLayout userRole="customer">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Lagrede søk</h1>
        {saved.length === 0 ? (
          <div className="border rounded-lg bg-white p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen lagrede søk ennå</h3>
            <p className="text-gray-600">Bruk filtrene i annonsesidene og lagre søket for å få e‑postvarsler.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {saved.map((s) => (
              <SavedSearchRow
                key={s.id}
                id={s.id}
                name={s.name}
                createdAt={s.createdAt}
                queryJson={s.queryJson}
                frequency={(s as any).frequency}
              />
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  )
}


