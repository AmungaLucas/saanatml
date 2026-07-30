import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH update maker
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  try {
    const maker = await db.maker.update({
      where: { id },
      data: body,
    })
    return NextResponse.json(maker)
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update maker' }, { status: 500 })
  }
}

// DELETE maker
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await db.maker.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete maker' }, { status: 500 })
  }
}
