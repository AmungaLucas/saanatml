import { NextRequest, NextResponse } from 'next/server'
import { uploadToCDN, CDN_FOLDERS, type CDNFolder } from '@/lib/cdn'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'misc'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!CDN_FOLDERS.includes(folder as CDNFolder)) {
      return NextResponse.json({ error: `Invalid folder. Use: ${CDN_FOLDERS.join(', ')}` }, { status: 400 })
    }

    const result = await uploadToCDN(file, folder as CDNFolder)
    return NextResponse.json({ success: true, data: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    const status = message.includes('not allowed') || message.includes('too large') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
