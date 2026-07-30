import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  const { name, email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    const subscription = await db.newsletterSubscription.create({
      data: { name: name || '', email },
    })
    return NextResponse.json(subscription, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Email already subscribed' }, { status: 409 })
  }
}
