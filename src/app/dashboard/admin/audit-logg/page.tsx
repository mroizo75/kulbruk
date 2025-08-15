import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/dashboard-layout'

export default async function AuditLoggPage({ searchParams }: { searchParams?: { q?: string; action?: string } }) {
  const session = await auth()
  if (!session?.user) redirect('/sign-in?callbackUrl=/dashboard/admin/audit-logg')
  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { role: true } })
  if (!user || user.role !== 'admin') redirect('/dashboard')

  const q = searchParams?.q || ''
  const action = searchParams?.action || ''

  const logs = await prisma.auditLog.findMany({
    where: {
      AND: [
        action ? { action } : {},
        q ? { OR: [
          { targetId: { contains: q } },
          { targetType: { contains: q } },
          { details: { contains: q } },
        ] } : {},
      ] as any,
    },
    include: { actor: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold mb-4">Audit‑logg</h1>
        <form className="flex items-center gap-2 mb-4">
          <input name="q" defaultValue={q} placeholder="Søk…" className="border rounded px-2 py-1 text-sm" />
          <select name="action" defaultValue={action} className="border rounded px-2 py-1 text-sm">
            <option value="">Alle handlinger</option>
            <option>ADMIN_LISTING_APPROVE</option>
            <option>ADMIN_LISTING_REJECT</option>
            <option>ADMIN_LISTING_DELETE</option>
          </select>
          <button className="px-3 py-1.5 border rounded text-sm">Filtrer</button>
        </form>
        <div className="border rounded bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Tid</th>
                <th className="p-2">Bruker</th>
                <th className="p-2">Action</th>
                <th className="p-2">Target</th>
                <th className="p-2">Detaljer</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b last:border-0">
                  <td className="p-2 whitespace-nowrap">{new Date(l.createdAt).toLocaleString('no-NO')}</td>
                  <td className="p-2">{l.actor.email}</td>
                  <td className="p-2">{l.action}</td>
                  <td className="p-2">{l.targetType}:{l.targetId}</td>
                  <td className="p-2 max-w-[360px] truncate">{l.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}


