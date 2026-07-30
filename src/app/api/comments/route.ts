import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  const { articleId, author, content } = await request.json()

  if (!articleId || !author || !content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const comment = await db.comment.create({
    data: { articleId, author, content },
    include: { article: { select: { title: true } } },
  })

  return NextResponse.json(comment, { status: 201 })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const articleId = searchParams.get('articleId')

  if (!articleId) {
    return NextResponse.json({ error: 'Missing articleId' }, { status: 400 })
  }

  const comments = await db.comment.findMany({
    where: { articleId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(comments)
}
