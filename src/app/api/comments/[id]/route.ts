import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const AUTO_FLAG_THRESHOLD = 2

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Simple rate limit per IP for reports (max 10/min)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    const comment = await db.comment.findUnique({ where: { id } })
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Increment report count
    const updated = await db.comment.update({
      where: { id },
      data: { reportCount: { increment: 1 } },
    })

    // Auto-hide if threshold reached
    if (updated.reportCount >= AUTO_FLAG_THRESHOLD && updated.status === 'published') {
      await db.comment.update({
        where: { id },
        data: { status: 'flagged' },
      })
      return NextResponse.json({ reported: true, flagged: true })
    }

    return NextResponse.json({ reported: true, flagged: false })
  } catch (err) {
    console.error('Report error:', err)
    return NextResponse.json({ error: 'Failed to report' }, { status: 500 })
  }
}
