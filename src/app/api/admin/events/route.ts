import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all events
export async function GET() {
  try {
    const events = await db.event.findMany({
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(events)
  } catch (err) {
    console.error('Events GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

// POST create new event
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, description, date, endDate, venue, city, category, imageUrl, ticketUrl, isFeatured, isPast } = body

  if (!title || !date || !venue || !city) {
    return NextResponse.json({ error: 'Missing required fields: title, date, venue, city' }, { status: 400 })
  }

  try {
    const event = await db.event.create({
      data: {
        title,
        description: description || '',
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        venue,
        city,
        category: category || '',
        imageUrl: imageUrl || '',
        ticketUrl: ticketUrl || '',
        isFeatured: isFeatured || false,
        isPast: isPast || false,
      },
    })
    return NextResponse.json(event, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
