import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { uploadToCDN, CDN_FOLDERS, type CDNFolder } from '@/lib/cdn'

/** Image MIME types that sharp can convert to WebP */
const CONVERTIBLE_MIME = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/avif', 'image/tiff', 'image/bmp',
])

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

    // Convert raster images to WebP; pass SVG/already-WebP through as-is
    let uploadFile: File | Blob = file
    let uploadName: string | undefined = undefined

    if (CONVERTIBLE_MIME.has(file.type) || file.type === 'image/webp') {
      // Skip if already WebP
      if (file.type !== 'image/webp') {
        const buffer = Buffer.from(await file.arrayBuffer())
        const webpBuffer = await sharp(buffer)
          .webp({ quality: 80, effort: 4 })
          .toBuffer()

        // Build new filename: original-name.webp
        const baseName = file.name.replace(/\.[^.]+$/, '')
        uploadName = `${baseName}.webp`
        uploadFile = new Blob([new Uint8Array(webpBuffer)], { type: 'image/webp' })
      }
    }

    const result = await uploadToCDN(uploadFile, folder as CDNFolder, uploadName)
    return NextResponse.json({ success: true, data: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    const status = message.includes('not allowed') || message.includes('too large') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
