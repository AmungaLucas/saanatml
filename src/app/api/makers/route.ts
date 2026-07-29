import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const makers = await db.maker.findMany({
    orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
  })
  return NextResponse.json(makers)
}
