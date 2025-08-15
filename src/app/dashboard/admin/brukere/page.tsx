import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Users, Crown, Shield, User, Mail, Calendar, MoreVertical } from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PrismaClient } from '@prisma/client'
import UserRoleActions from '@/components/user-role-actions'

const prisma = new PrismaClient()

export default async function AdminUsersPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/sign-in?redirectUrl=/dashboard/admin/brukere')
  }

  // Sjekk at brukeren er admin
  const currentDbUser = await prisma.user.findUnique({
    where: { id: session.user?.id }
  })

  if (!currentDbUser || currentDbUser.role !== 'admin') {
    redirect('/dashboard')
  }

  // Hent alle brukere
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          listings: true
        }
      }
    }
  })

  const roleStats = {
    admin: users.filter(u => u.role === 'admin').length,
    moderator: users.filter(u => u.role === 'moderator').length,
    customer: users.filter(u => u.role === 'customer').length,
    business: users.filter(u => u.role === 'business').length,
  }

  function getRoleIcon(role: string) {
    switch (role) {
      case 'admin': return Crown
      case 'moderator': return Shield
      case 'business': return Users
      default: return User
    }
  }

  function getRoleColor(role: string) {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'moderator': return 'bg-blue-100 text-blue-800'
      case 'business': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  function getTimeAgo(date: Date) {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'I dag'
    if (diffInDays === 1) return 'I går'
    if (diffInDays < 7) return `${diffInDays} dager siden`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} uker siden`
    return `${Math.floor(diffInDays / 30)} måneder siden`
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        {/* Overskrift */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Brukeradministrasjon</h1>
          <p className="text-gray-600">
            Administrer {users.length} brukere og deres roller i systemet
          </p>
        </div>

        {/* Statistikk */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Crown className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-gray-900">{roleStats.admin}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Moderatorer</p>
                  <p className="text-2xl font-bold text-gray-900">{roleStats.moderator}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bedrifter</p>
                  <p className="text-2xl font-bold text-gray-900">{roleStats.business}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-gray-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Kunder</p>
                  <p className="text-2xl font-bold text-gray-900">{roleStats.customer}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Brukere liste */}
          <Card>
          <CardHeader>
            <CardTitle>Alle brukere</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Ingen brukere funnet.</p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Bruker</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Rolle</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Annonser</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Registrert</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const RoleIcon = getRoleIcon(user.role)
                    return (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-600" />
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className={getRoleColor(user.role)}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-900">{user._count.listings}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-500">{getTimeAgo(user.createdAt)}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {user.id !== currentDbUser.id && (
                            <UserRoleActions 
                              userId={user.id} 
                              currentRole={user.role} 
                              userName={`${user.firstName} ${user.lastName}`}
                            />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}