import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''
    const author = searchParams.get('author') || ''
    const featured = searchParams.get('featured') === 'true'
    const page = Number(searchParams.get('page')) || 1
    const limit = Math.min(Number(searchParams.get('limit')) || 12, 50)

    const where: Prisma.ArticleWhereInput = {}
    if (category) {
      where.category = { slug: category }
    }
    if (author) {
      where.author = { slug: author }
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { tags: { contains: search } },
      ]
    }
    if (featured) {
      where.isFeatured = true
    }

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        include: {
          category: true,
          author: true,
          comments: { select: { id: true } },
        },
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.article.count({ where }),
    ])

    return NextResponse.json({
      articles: articles.map(a => ({
        ...a,
        commentCount: a.comments.length,
        comments: undefined,
      })),
      total,
      pages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('Articles GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}
