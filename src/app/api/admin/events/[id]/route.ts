import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH update event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const data: any = { ...body }
  if (data.date) data.date = new Date(data.date)
  if (data.endDate) data.endDate = new Date(data.endDate)

  try {
    const event = await db.event.update({
      where: { id },
      data,
    })
    return NextResponse.json(event)
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

// DELETE event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await db.event.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
