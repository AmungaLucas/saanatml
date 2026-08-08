import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH update article
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Destructure only allowed fields to prevent arbitrary field injection
    const { title, slug, excerpt, content, coverImage, categoryId, authorId, readTime, tags, isFeatured, isPinned, publishedAt } = body
    const data: Record<string, any> = {}
    if (title !== undefined) data.title = title
    if (slug !== undefined) data.slug = slug
    if (excerpt !== undefined) data.excerpt = excerpt
    if (content !== undefined) data.content = content
    if (coverImage !== undefined) data.coverImage = coverImage
    if (categoryId !== undefined) data.categoryId = categoryId
    if (authorId !== undefined) data.authorId = authorId
    if (readTime !== undefined) data.readTime = readTime
    if (tags !== undefined) data.tags = tags
    if (isFeatured !== undefined) data.isFeatured = isFeatured
    if (isPinned !== undefined) data.isPinned = isPinned
    if (publishedAt !== undefined) data.publishedAt = new Date(publishedAt)

    const article = await db.article.update({
      where: { id },
      data,
      include: { category: true, author: true },
    })
    return NextResponse.json(article)
  } catch (e: any) {
    if (e.code === 'P2025') {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    console.error('Article PATCH error:', e)
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

// DELETE article
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.article.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.code === 'P2025') {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
    console.error('Article DELETE error:', e)
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
