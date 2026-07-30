import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all subscribers
export async function GET() {
  const subscribers = await db.newsletterSubscription.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(subscribers)
}
