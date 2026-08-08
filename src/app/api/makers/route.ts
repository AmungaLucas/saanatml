import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const makers = await db.maker.findMany({
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
    })
    return NextResponse.json(makers)
  } catch (err) {
    console.error('Makers GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch makers' }, { status: 500 })
  }
}
