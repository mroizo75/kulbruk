import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as { id?: string }).id },
    select: { role: true },
  })
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')
  const format = searchParams.get('format') || 'json'

  if (!sessionId || !sessionId.startsWith('SUPPORT-')) {
    return NextResponse.json(
      { error: 'Missing or invalid sessionId. Use ?sessionId=SUPPORT-YYYYMMDD-XXX' },
      { status: 400 }
    )
  }

  const logs = await prisma.hotelRequestLog.findMany({
    where: { supportSessionId: sessionId },
    orderBy: { createdAt: 'asc' },
  })

  if (format === 'txt') {
    const lines = logs.map(
      (l) =>
        `[${l.createdAt.toISOString()}] ${l.method} ${l.path} (${l.responseStatus} | ${l.durationMs}ms)\n` +
        `  Request: ${(l.requestBody || '—').slice(0, 500)}\n` +
        `  Response: ${(l.responsePreview || '—').slice(0, 800)}\n`
    )
    return new NextResponse(lines.join('\n---\n\n'), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="support-log-${sessionId}.txt"`,
      },
    })
  }

  return NextResponse.json({ sessionId, logs })
}
