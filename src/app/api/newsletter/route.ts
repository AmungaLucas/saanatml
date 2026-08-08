import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const subscription = await db.newsletterSubscription.create({
      data: { name: name || '', email },
    })
    return NextResponse.json(subscription, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Email already subscribed' }, { status: 409 })
    }
    console.error('Newsletter POST error:', e)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
