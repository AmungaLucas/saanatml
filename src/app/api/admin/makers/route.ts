import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'

// GET all makers
export async function GET(request: NextRequest) {
  const guard = requireAuth(request)
  if (guard) return guard

  try {
    const makers = await db.maker.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(makers)
  } catch (err) {
    console.error('Makers GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch makers' }, { status: 500 })
  }
}

// POST create new maker
export async function POST(request: NextRequest) {
  const guard = requireAuth(request)
  if (guard) return guard

  try {
    const body = await request.json()
    const { name, slug, discipline, bio, location, website, instagram, twitter, isFeatured } = body

    if (!name || !slug || !discipline) {
      return NextResponse.json({ error: 'Missing required fields: name, slug, discipline' }, { status: 400 })
    }

    const maker = await db.maker.create({
      data: {
        name, slug, discipline,
        bio: bio || '', location: location || '',
        website: website || '', instagram: instagram || '',
        twitter: twitter || '', isFeatured: isFeatured || false,
      },
    })
    return NextResponse.json(maker, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    console.error('Maker POST error:', e)
    return NextResponse.json({ error: 'Failed to create maker' }, { status: 500 })
  }
}
