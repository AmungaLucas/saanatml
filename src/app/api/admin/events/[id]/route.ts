import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH update event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { title, description, date, endDate, venue, city, category, imageUrl, ticketUrl, isFeatured, isPast, categoryId } = body
    const data: Record<string, any> = {}
    if (title !== undefined) data.title = title
    if (description !== undefined) data.description = description
    if (date !== undefined) {
      const d = new Date(date)
      if (isNaN(d.getTime())) return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
      data.date = d
    }
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null
    if (venue !== undefined) data.venue = venue
    if (city !== undefined) data.city = city
    if (category !== undefined) data.category = category
    if (categoryId !== undefined) data.categoryId = categoryId
    if (imageUrl !== undefined) data.imageUrl = imageUrl
    if (ticketUrl !== undefined) data.ticketUrl = ticketUrl
    if (isFeatured !== undefined) data.isFeatured = isFeatured
    if (isPast !== undefined) data.isPast = isPast

    const event = await db.event.update({ where: { id }, data })
    return NextResponse.json(event)
  } catch (e: any) {
    if (e.code === 'P2025') return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    console.error('Event PATCH error:', e)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

// DELETE event
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.event.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.code === 'P2025') return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    console.error('Event DELETE error:', e)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}