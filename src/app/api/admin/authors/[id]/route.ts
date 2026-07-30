import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH update author
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  try {
    const author = await db.author.update({
      where: { id },
      data: body,
    })
    return NextResponse.json(author)
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update author' }, { status: 500 })
  }
}

// DELETE author
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await db.author.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete author' }, { status: 500 })
  }
}
