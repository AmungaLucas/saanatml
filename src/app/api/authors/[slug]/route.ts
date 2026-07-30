import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const author = await db.author.findUnique({
    where: { slug },
    include: {
      articles: {
        include: { category: true, author: true, comments: { select: { id: true } } },
        orderBy: { publishedAt: 'desc' },
      },
    },
  })

  if (!author) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    author: {
      ...author,
      articles: author.articles.map(a => ({ ...a, commentCount: a.comments.length })),
    },
  })
}
