import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/dashboard-layout'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { MessageSquare, ArrowRight } from 'lucide-react'

export default async function CustomerMessagesPage() {
  const session = await auth()
  if (!session?.user) redirect('/sign-in?callbackUrl=/dashboard/customer/meldinger')
  const userId = (session.user as any).id as string

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: {
      listing: { select: { id: true, title: true, images: { select: { url: true }, take: 1 } } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { lastMessageAt: 'desc' },
  })

  return (
    <DashboardLayout userRole="customer">
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meldinger</h1>
          <p className="text-sm text-gray-600">Chat med kjøpere og selgere. Nye meldinger vises øverst.</p>
        </div>

        {conversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingen samtaler ennå</h3>
              <p className="text-gray-600 mb-4">Start en samtale ved å kontakte en selger fra en annonse.</p>
              <Button asChild>
                <Link href="/annonser">
                  Finn annonser <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {conversations.map((c) => {
              const last = c.messages[0]
              const preview = last?.content ? (last.content.length > 120 ? last.content.slice(0, 120) + '…' : last.content) : 'Ingen meldinger ennå'
              const img = c.listing?.images?.[0]?.url || ''
              return (
                <Link key={c.id} href={`/dashboard/customer/meldinger/${c.id}`}>
                  <Card className="hover:shadow-sm transition">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                          {img ? (
                            <Image src={img} alt={c.listing?.title || 'Annonse'} width={64} height={64} className="object-cover w-full h-full" />
                          ) : (
                            <span className="text-xs text-gray-400">Ingen bilde</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="font-medium text-gray-900 truncate">{c.listing?.title || 'Annonse'}</h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(c.lastMessageAt).toLocaleString('nb-NO')}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{preview}</p>
                        </div>
                        <div className="hidden sm:block">
                          <Badge variant="outline">Åpne</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}


