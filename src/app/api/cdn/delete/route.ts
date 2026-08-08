import { NextRequest, NextResponse } from 'next/server'
import { deleteFromCDN } from '@/lib/cdn'

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json()
    if (!path) {
      return NextResponse.json({ error: 'Missing file path' }, { status: 400 })
    }
    await deleteFromCDN(path)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Delete failed'
    return NextResponse.json({ error: message }, { status: message.includes('not found') ? 404 : 500 })
  }
}
