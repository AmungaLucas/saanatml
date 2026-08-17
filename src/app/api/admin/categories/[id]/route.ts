import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'

// PATCH update category
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = requireAuth(request)
  if (guard) return guard

  try {
    const { id } = await params
    const body = await request.json()

    const { name, slug, description, color } = body
    const data: Record<string, any> = {}
    if (name !== undefined) data.name = name
    if (slug !== undefined) data.slug = slug
    if (description !== undefined) data.description = description
    if (color !== undefined) data.color = color

    const category = await db.category.update({ where: { id }, data })
    return NextResponse.json(category)
  } catch (e: any) {
    if (e.code === 'P2025') return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    if (e.code === 'P2002') return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    console.error('Category PATCH error:', e)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = requireAuth(request)
  if (guard) return guard

  try {
    const { id } = await params
    await db.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.code === 'P2025') return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    console.error('Category DELETE error:', e)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
