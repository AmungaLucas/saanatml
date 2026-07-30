import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const article = await db.article.findUnique({
    where: { slug },
    include: {
      category: true,
      author: true,
      comments: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!article) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Increment views
  await db.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  })

  // Get related articles
  const related = await db.article.findMany({
    where: {
      id: { not: article.id },
      categoryId: article.categoryId,
    },
    take: 4,
    include: { category: true, author: true },
    orderBy: { publishedAt: 'desc' },
  })

  return NextResponse.json({ article: { ...article, views: article.views + 1 }, related })
}
