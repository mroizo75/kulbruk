import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/dashboard-layout'
import ConversationInput from './conversation-input'

export default async function ConversationPage({ params }: { params: { conversationId: string } }) {
  const session = await auth()
  if (!session?.user) redirect('/sign-in?callbackUrl=/dashboard/customer/meldinger')
  const userId = (session.user as any).id as string
  const { conversationId } = await params

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      listing: { select: { id: true, title: true } },
      messages: { orderBy: { createdAt: 'asc' } },
      buyer: { select: { id: true, firstName: true, lastName: true } },
      seller: { select: { id: true, firstName: true, lastName: true } },
    }
  })
  if (!conversation) redirect('/dashboard/customer/meldinger')
  // Marker innkommende meldinger som lest
  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  })
  const otherParty = conversation.buyerId === userId ? conversation.seller : conversation.buyer

  return (
    <DashboardLayout userRole="customer">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">{conversation.listing?.title}</h1>
        <p className="text-sm text-gray-600 mb-4">Samtale med {otherParty?.firstName} {otherParty?.lastName}</p>
        <div className="border rounded p-3 bg-white">
          <div className="space-y-3">
            {conversation.messages.map((m) => (
              <div key={m.id} className={m.senderId === userId ? 'text-right' : 'text-left'}>
                <div className={`inline-block px-3 py-2 rounded ${m.senderId === userId ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  {m.content}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">{new Date(m.createdAt).toLocaleString('no-NO')}</div>
              </div>
            ))}
          </div>
          <ConversationInput conversationId={conversation.id} />
        </div>
      </div>
    </DashboardLayout>
  )
}


