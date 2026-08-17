import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'

// GET all articles for admin
export async function GET(request: NextRequest) {
  const guard = requireAuth(request)
  if (guard) return guard

  try {
    const articles = await db.article.findMany({
      include: { category: true, author: true, comments: { select: { id: true } } },
      orderBy: { publishedAt: 'desc' },
    })
    return NextResponse.json(articles.map(a => ({ ...a, commentCount: a.comments.length })))
  } catch (err) {
    console.error('Articles GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

// POST create new article
export async function POST(request: NextRequest) {
  const guard = requireAuth(request)
  if (guard) return guard

  try {
    const body = await request.json()
    const { title, slug, excerpt, content, coverImage, categoryId, authorId, readTime, tags, isFeatured, isPinned } = body

    if (!title || !slug || !categoryId || !authorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const article = await db.article.create({
      data: {
        title, slug, excerpt: excerpt || '', content: content || '',
        coverImage: coverImage || '', categoryId, authorId,
        readTime: readTime || 5, tags: tags || '',
        isFeatured: isFeatured || false, isPinned: isPinned || false,
        publishedAt: new Date(),
      },
      include: { category: true, author: true },
    })
    return NextResponse.json(article, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    console.error('Article POST error:', e)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}
