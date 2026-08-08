import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
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

    const [comments, total] = await Promise.all([
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
    ])

    // Stats may fail if 'status' column doesn't exist yet
    let stats = { published: 0, flagged: 0, removed: 0, total }
    try {
      const statsResult = await db.comment.groupBy({ by: ['status'], _count: true })
      const statsMap = Object.fromEntries(statsResult.map((s: any) => [s.status, s._count]))
      stats = {
        published: statsMap['published'] || 0,
        flagged: statsMap['flagged'] || 0,
        removed: statsMap['removed'] || 0,
        total,
      }
    } catch {
      stats = { published: total, flagged: 0, removed: 0, total }
    }

    return NextResponse.json({
      comments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats,
    })
  } catch (err) {
    console.error('Admin comments GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}
