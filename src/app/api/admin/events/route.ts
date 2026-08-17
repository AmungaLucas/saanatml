import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'

// GET all events
export async function GET(request: NextRequest) {
  const guard = requireAuth(request)
  if (guard) return guard

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
  const guard = requireAuth(request)
  if (guard) return guard

  try {
    const body = await request.json()
    const { title, description, date, endDate, venue, city, category, imageUrl, ticketUrl, isFeatured, isPast } = body

    if (!title || !date || !venue || !city) {
      return NextResponse.json({ error: 'Missing required fields: title, date, venue, city' }, { status: 400 })
    }

    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const event = await db.event.create({
      data: {
        title,
        description: description || '',
        date: parsedDate,
        endDate: endDate ? (() => { const d = new Date(endDate); if (isNaN(d.getTime())) return null; return d })() : null,
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
    console.error('Event POST error:', e)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
