import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// DELETE subscriber
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await db.newsletterSubscription.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 })
  }
}
