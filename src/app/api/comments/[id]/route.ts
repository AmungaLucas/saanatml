import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const AUTO_FLAG_THRESHOLD = 2

// Simple in-memory rate limiter for reports (per IP, per minute)
const reportRateLimit = new Map<string, { count: number; resetAt: number }>()
const MAX_REPORTS_PER_MINUTE = 10

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = reportRateLimit.get(ip)
  if (!entry || now > entry.resetAt) {
    reportRateLimit.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  entry.count++
  return entry.count > MAX_REPORTS_PER_MINUTE
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Rate limit reports per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many reports. Please wait.' }, { status: 429 })
    }

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
