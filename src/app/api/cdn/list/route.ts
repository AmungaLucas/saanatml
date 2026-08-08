import { NextRequest, NextResponse } from 'next/server'
import { listCDNFiles, CDN_FOLDERS, type CDNFolder } from '@/lib/cdn'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || undefined
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20))

    if (folder && !CDN_FOLDERS.includes(folder as CDNFolder)) {
      return NextResponse.json({ error: `Invalid folder. Use: ${CDN_FOLDERS.join(', ')}` }, { status: 400 })
    }

    const result = await listCDNFiles(folder as CDNFolder | undefined, page, limit)
    return NextResponse.json({ success: true, data: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'List failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
