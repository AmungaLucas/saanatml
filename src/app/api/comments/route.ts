import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Simple in-memory rate limiter (per IP, per minute)
const commentRateLimit = new Map<string, { count: number; resetAt: number }>()
const MAX_COMMENTS_PER_MINUTE = 3
const MIN_SUBMIT_TIME_MS = 3000 // 3 seconds

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = commentRateLimit.get(ip)
  if (!entry || now > entry.resetAt) {
    commentRateLimit.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  entry.count++
  return entry.count > MAX_COMMENTS_PER_MINUTE
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { articleId, author, content, website, _submitTime } = body

    // --- Honeypot check ---
    // 'website' field is hidden from humans; if filled, it's a bot
    if (website) {
      return NextResponse.json({ error: 'Comment submitted' }, { status: 200 })
    }

    // --- Missing fields ---
    if (!articleId || !author?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // --- Min time gate ---
    // If form submitted in under 3 seconds, it's likely a bot
    if (_submitTime && Date.now() - _submitTime < MIN_SUBMIT_TIME_MS) {
      return NextResponse.json({ error: 'Comment submitted' }, { status: 200 })
    }

    // --- Rate limiting ---
    const ip = getClientIp(request)
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many comments. Please wait a moment.' },
        { status: 429 }
      )
    }

    // --- Content length check ---
    if (content.trim().length > 2000) {
      return NextResponse.json({ error: 'Comment is too long' }, { status: 400 })
    }
    if (author.trim().length > 50) {
      return NextResponse.json({ error: 'Name is too long' }, { status: 400 })
    }

    const comment = await db.comment.create({
      data: {
        articleId,
        author: author.trim(),
        content: content.trim(),
        status: 'published',
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (err) {
    console.error('Comment POST error:', err)
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const articleId = searchParams.get('articleId')

  if (!articleId) {
    return NextResponse.json({ error: 'Missing articleId' }, { status: 400 })
  }

  // Only return published comments to public
  const comments = await db.comment.findMany({
    where: { articleId, status: 'published' },
    orderBy: { createdAt: 'desc' },
  })

  // Get total published count for the article
  const count = await db.comment.count({
    where: { articleId, status: 'published' },
  })

  return NextResponse.json({ comments, total: count })
}
