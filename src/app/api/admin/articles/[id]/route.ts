import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH update article
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  try {
    const article = await db.article.update({
      where: { id },
      data: body,
      include: { category: true, author: true },
    })
    return NextResponse.json(article)
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

// DELETE article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    await db.article.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
