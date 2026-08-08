import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH update author
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Allowlist fields
    const { name, slug, bio, avatar, role } = body
    const data: Record<string, any> = {}
    if (name !== undefined) data.name = name
    if (slug !== undefined) data.slug = slug
    if (bio !== undefined) data.bio = bio
    if (avatar !== undefined) data.avatar = avatar
    if (role !== undefined) data.role = role

    const author = await db.author.update({ where: { id }, data })
    return NextResponse.json(author)
  } catch (e: any) {
    if (e.code === 'P2025') return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    if (e.code === 'P2002') return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    console.error('Author PATCH error:', e)
    return NextResponse.json({ error: 'Failed to update author' }, { status: 500 })
  }
}

// DELETE author
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.author.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.code === 'P2025') return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    console.error('Author DELETE error:', e)
    return NextResponse.json({ error: 'Failed to delete author' }, { status: 500 })
  }
}
