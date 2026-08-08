import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const authors = await db.author.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(authors)
  } catch (err) {
    console.error('Authors GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 })
  }
}
