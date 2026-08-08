import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET stats for admin dashboard
export async function GET() {
  try {
    const [articleCount, authorCount, categoryCount, eventCount, commentCount, makerCount, subscriberCount, totalViews] = await Promise.all([
      db.article.count(),
      db.author.count(),
      db.category.count(),
      db.event.count(),
      db.comment.count(),
      db.maker.count(),
      db.newsletterSubscription.count(),
      db.article.aggregate({ _sum: { views: true } }),
    ])

    // These may fail if DB schema hasn't been migrated yet
    let flaggedCount = 0
    let commentBreakdown = { published: commentCount, flagged: 0, removed: 0 }
    let recentFlagged: any[] = []

    try {
      const [fc, cs, rf] = await Promise.all([
        db.comment.count({ where: { status: 'flagged' } }),
        db.comment.groupBy({ by: ['status'], _count: true }),
        db.comment.findMany({
          where: { status: 'flagged' },
          orderBy: { reportCount: 'desc' },
          include: { article: { select: { title: true, slug: true } } },
          take: 5,
        }),
      ])
      flaggedCount = fc
      const statsMap = Object.fromEntries(cs.map((s: any) => [s.status, s._count]))
      commentBreakdown = {
        published: statsMap['published'] || 0,
        flagged: statsMap['flagged'] || 0,
        removed: statsMap['removed'] || 0,
      }
      recentFlagged = rf
    } catch {
      // Comment stats unavailable — use defaults
    }

    return NextResponse.json({
      articles: articleCount,
      authors: authorCount,
      categories: categoryCount,
      events: eventCount,
      comments: commentCount,
      makers: makerCount,
      subscribers: subscriberCount,
      totalViews: totalViews._sum.views || 0,
      flaggedComments: flaggedCount,
      commentBreakdown,
      recentFlagged,
    })
  } catch (err) {
    console.error('Admin stats GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
