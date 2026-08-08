import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all subscribers
export async function GET() {
  try {
    const subscribers = await db.newsletterSubscription.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(subscribers)
  } catch (err) {
    console.error('Subscribers GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }
}
