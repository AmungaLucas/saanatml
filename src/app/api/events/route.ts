import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const events = await db.event.findMany({
    orderBy: [{ isPast: 'asc' }, { date: 'asc' }],
    include: { categoryRef: { select: { name: true, color: true } } },
  })
  return NextResponse.json(events)
}
