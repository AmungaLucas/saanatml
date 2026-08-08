import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH update maker
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { name, slug, discipline, bio, location, website, instagram, twitter, isFeatured } = body
    const data: Record<string, any> = {}
    if (name !== undefined) data.name = name
    if (slug !== undefined) data.slug = slug
    if (discipline !== undefined) data.discipline = discipline
    if (bio !== undefined) data.bio = bio
    if (location !== undefined) data.location = location
    if (website !== undefined) data.website = website
    if (instagram !== undefined) data.instagram = instagram
    if (twitter !== undefined) data.twitter = twitter
    if (isFeatured !== undefined) data.isFeatured = isFeatured

    const maker = await db.maker.update({ where: { id }, data })
    return NextResponse.json(maker)
  } catch (e: any) {
    if (e.code === 'P2025') return NextResponse.json({ error: 'Maker not found' }, { status: 404 })
    if (e.code === 'P2002') return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    console.error('Maker PATCH error:', e)
    return NextResponse.json({ error: 'Failed to update maker' }, { status: 500 })
  }
}

// DELETE maker
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.maker.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.code === 'P2025') return NextResponse.json({ error: 'Maker not found' }, { status: 404 })
    console.error('Maker DELETE error:', e)
    return NextResponse.json({ error: 'Failed to delete maker' }, { status: 500 })
  }
}
