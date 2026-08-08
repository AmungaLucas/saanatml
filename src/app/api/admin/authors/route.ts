import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all authors
export async function GET() {
  try {
    const authors = await db.author.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(authors)
  } catch (err) {
    console.error('Authors GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 })
  }
}

// POST create new author
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, slug, bio, avatar, role } = body

  if (!name || !slug) {
    return NextResponse.json({ error: 'Missing required fields: name, slug' }, { status: 400 })
  }

  try {
    const author = await db.author.create({
      data: {
        name,
        slug,
        bio: bio || '',
        avatar: avatar || '',
        role: role || 'Writer',
      },
    })
    return NextResponse.json(author, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create author' }, { status: 500 })
  }
}
