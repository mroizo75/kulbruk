import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any).role as string
  if (role !== 'admin' && role !== 'moderator') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { status } = await req.json()
  const id = params.id
  const handledById = (session.user as any).id as string
  const report = await prisma.report.update({ where: { id }, data: { status, handledById, handledAt: new Date() } })
  return NextResponse.json({ report })
}

