import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'
import bcrypt from 'bcryptjs'
import { sendCredentialsEmail } from '@/lib/email'

function generatePassword(len = 12): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
  let pw = ''
  for (let i = 0; i < len; i++) pw += chars[Math.floor(Math.random() * chars.length)]
  return pw
}

// GET all authors
export async function GET(request: NextRequest) {
  const guard = requireAuth(request)
  if (guard) return guard

  try {
    const authors = await db.author.findMany({
      include: { _count: { select: { articles: true } }, user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(authors)
  } catch (err) {
    console.error('Authors GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 })
  }
}

// POST create new author (optionally with login credentials)
export async function POST(request: NextRequest) {
  const guard = requireAuth(request)
  if (guard) return guard

  try {
    const body = await request.json()
    const { name, slug, bio, avatar, role, email } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Missing required fields: name, slug' }, { status: 400 })
    }

    const author = await db.author.create({
      data: {
        name,
        slug,
        bio: bio || '',
        avatar: avatar || '',
        role: role || 'Writer',
      },
    })

    // If an email was provided, create a User account and send credentials
    let credentialEmail = ''
    if (email && email.trim()) {
      const plainPassword = generatePassword()
      const hashedPassword = await bcrypt.hash(plainPassword, 10)

      try {
        await db.user.create({
          data: {
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role: 'editor',
            authorId: author.id,
          },
        })
        credentialEmail = email.trim()

        // Send credentials email (fire-and-forget)
        sendCredentialsEmail({
          to: credentialEmail,
          name,
          email: credentialEmail,
          password: plainPassword,
        }).then(ok => {
          if (ok) console.log(`Credentials sent to ${credentialEmail}`)
          else console.error(`Failed to send credentials to ${credentialEmail}`)
        })
      } catch (e: any) {
        // If user already exists, still return the author
        if (e.code !== 'P2002') console.error('User creation error:', e)
      }
    }

    return NextResponse.json({ ...author, credentialEmail }, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    console.error('Author POST error:', e)
    return NextResponse.json({ error: 'Failed to create author' }, { status: 500 })
  }
}
