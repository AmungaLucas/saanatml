import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || '' // 'flagged' | 'published' | 'removed' | '' (all)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    const where: any = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { author: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { article: { title: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [comments, total, stats] = await Promise.all([
      db.comment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          article: { select: { id: true, title: true, slug: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.comment.count({ where }),
      db.comment.groupBy({ by: ['status'], _count: true }),
    ])

    const statsMap = Object.fromEntries(stats.map(s => [s.status, s._count]))

    return NextResponse.json({
      comments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: {
        published: statsMap['published'] || 0,
        flagged: statsMap['flagged'] || 0,
        removed: statsMap['removed'] || 0,
        total: Object.values(statsMap).reduce((a: number, b: any) => a + (b as number), 0),
      },
    })
  } catch (err) {
    console.error('Admin comments GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}
