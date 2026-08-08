import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// DELETE subscriber
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.newsletterSubscription.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.code === 'P2025') return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 })
    console.error('Subscriber DELETE error:', e)
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 })
  }
}
