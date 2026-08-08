import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: { _count: { select: { articles: true, events: true } } },
      orderBy: { name: 'asc' },
  })
    return NextResponse.json(categories)
  } catch (err) {
    console.error('Categories GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, color } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Missing required fields: name, slug' }, { status: 400 })
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        description: description || '',
        color: color || '#8B2252',
      },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    console.error('Category POST error:', e)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
