import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const events = await db.event.findMany({
      orderBy: [{ isPast: 'asc' }, { date: 'asc' }],
      include: { categoryRef: { select: { name: true, color: true } } },
    })
    return NextResponse.json(events)
  } catch (err) {
    console.error('Events GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
