import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [flagged, recent, stats] = await Promise.all([
      // Flagged comments needing review
      db.comment.findMany({
        where: { status: 'flagged' },
        orderBy: { reportCount: 'desc' },
        include: {
          article: { select: { id: true, title: true, slug: true } },
        },
        take: 50,
      }),
      // Recent published comments
      db.comment.findMany({
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' },
        include: {
          article: { select: { id: true, title: true, slug: true } },
        },
        take: 20,
      }),
      // Stats
      db.comment.groupBy({
        by: ['status'],
        _count: true,
      }),
    ])

    const statsMap = Object.fromEntries(stats.map(s => [s.status, s._count]))

    return NextResponse.json({
      flagged,
      recent,
      stats: {
        published: statsMap['published'] || 0,
        flagged: statsMap['flagged'] || 0,
        removed: statsMap['removed'] || 0,
        total: (statsMap['published'] || 0) + (statsMap['flagged'] || 0) + (statsMap['removed'] || 0),
      },
    })
  } catch (err) {
    console.error('Admin comments GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}
