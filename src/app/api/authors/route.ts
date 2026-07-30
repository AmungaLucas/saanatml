import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const authors = await db.author.findMany({
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(authors)
}
