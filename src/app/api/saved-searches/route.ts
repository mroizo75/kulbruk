import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id as string
  const saved = await prisma.savedSearch.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ saved })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id as string
  const { name, queryJson, frequency } = await req.json()
  if (!queryJson) return NextResponse.json({ error: 'Missing queryJson' }, { status: 400 })
  const item = await prisma.savedSearch.create({ data: { userId, name, queryJson, frequency: ['daily','weekly'].includes((frequency||'').toLowerCase()) ? frequency.toLowerCase() : 'daily' } })
  return NextResponse.json({ saved: item })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id as string
  const { id, frequency } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const allowed = ['daily', 'weekly', 'off']
  const freq = String((frequency || '')).toLowerCase()
  if (!allowed.includes(freq)) {
    return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 })
  }
  const updated = await prisma.savedSearch.update({ where: { id }, data: { frequency: freq } })
  return NextResponse.json({ saved: updated })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id as string
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await prisma.savedSearch.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

