import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET stats for admin dashboard
export async function GET() {
  const [
    articleCount,
    authorCount,
    categoryCount,
    eventCount,
    commentCount,
    makerCount,
    subscriberCount,
    totalViews,
    flaggedCount,
    commentStats,
    recentFlagged,
  ] = await Promise.all([
    db.article.count(),
    db.author.count(),
    db.category.count(),
    db.event.count(),
    db.comment.count(),
    db.maker.count(),
    db.newsletterSubscription.count(),
    db.article.aggregate({ _sum: { views: true } }),
    db.comment.count({ where: { status: 'flagged' } }),
    db.comment.groupBy({ by: ['status'], _count: true }),
    // Last 5 flagged comments for quick-preview on overview
    db.comment.findMany({
      where: { status: 'flagged' },
      orderBy: { reportCount: 'desc' },
      include: { article: { select: { title: true, slug: true } } },
      take: 5,
    }),
  ])

  const statsMap = Object.fromEntries(commentStats.map(s => [s.status, s._count]))

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
    commentBreakdown: {
      published: statsMap['published'] || 0,
      flagged: statsMap['flagged'] || 0,
      removed: statsMap['removed'] || 0,
    },
    recentFlagged,
  })
}