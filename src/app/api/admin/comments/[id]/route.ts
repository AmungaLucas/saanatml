import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!['published', 'flagged', 'removed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const comment = await db.comment.update({
      where: { id },
      data: { status, reportCount: status === 'published' ? 0 : undefined },
    })

    return NextResponse.json(comment)
  } catch (err: any) {
    if (err.code === 'P2025') return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    console.error('Admin comment PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.comment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.code === 'P2025') return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    console.error('Admin comment DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
