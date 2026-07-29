import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET stats for admin dashboard
export async function GET() {
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

  return NextResponse.json({
    articles: articleCount,
    authors: authorCount,
    categories: categoryCount,
    events: eventCount,
    comments: commentCount,
    makers: makerCount,
    subscribers: subscriberCount,
    totalViews: totalViews._sum.views || 0,
  })
}
