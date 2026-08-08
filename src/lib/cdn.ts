/**
 * CDN Client — talks to cdn.sanaathrumylens.co.ke PHP API
 *
 * Server-side only functions (upload, delete, list) use CDN_API_KEY.
 * Client-side code should call /api/cdn/* proxy routes.
 */

export const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.sanaathrumylens.co.ke'
export const CDN_API_KEY = process.env.CDN_API_KEY || ''

// ── Types ───────────────────────────────────────────────────

export interface CDNFile {
  url: string
  path: string
  filename: string
  size: number
  mimeType: string
  modified: string
}

export interface CDNUploadResult {
  url: string
  filename: string
  originalName: string
  size: number
  mimeType: string
  folder: string
  path: string
}

export interface CDNListResult {
  files: CDNFile[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ── Allowed folders ─────────────────────────────────────────

export const CDN_FOLDERS = ['posts', 'artists', 'events', 'profiles', 'ads', 'misc'] as const
export type CDNFolder = (typeof CDN_FOLDERS)[number]

// ── Allowed MIME types ──────────────────────────────────────

const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif',
])

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

// ── Server-side helpers (used by API routes) ────────────────

/** Upload a file to the CDN. Must be called from a server component or API route. */
export async function uploadToCDN(
  file: File | Blob,
  folder: CDNFolder = 'misc',
  fileName?: string,
): Promise<CDNUploadResult> {
  if (!CDN_API_KEY) throw new Error('CDN_API_KEY is not configured')

  // Validate MIME
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error(`File type '${file.type}' is not allowed. Use JPEG, PNG, GIF, WebP, SVG, or AVIF.`)
  }

  // Validate size
  if (file.size > MAX_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB.`)
  }

  const form = new FormData()
  form.append('file', file, fileName || undefined)
  form.append('folder', folder)

  const res = await fetch(`${CDN_URL}/api/upload.php`, {
    method: 'POST',
    headers: { 'X-API-Key': CDN_API_KEY },
    body: form,
  })

  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'CDN upload failed')
  return json.data as CDNUploadResult
}

/** Delete a file from the CDN by its relative path. */
export async function deleteFromCDN(path: string): Promise<void> {
  if (!CDN_API_KEY) throw new Error('CDN_API_KEY is not configured')

  const res = await fetch(`${CDN_URL}/api/delete.php`, {
    method: 'DELETE',
    headers: {
      'X-API-Key': CDN_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path }),
  })

  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'CDN delete failed')
}

/** List files from the CDN, optionally filtered by folder. */
export async function listCDNFiles(
  folder?: CDNFolder,
  page = 1,
  limit = 20,
): Promise<CDNListResult> {
  if (!CDN_API_KEY) throw new Error('CDN_API_KEY is not configured')

  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (folder) params.set('folder', folder)

  const res = await fetch(`${CDN_URL}/api/list.php?${params}`, {
    headers: { 'X-API-Key': CDN_API_KEY },
  })

  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'CDN list failed')
  return json.data as CDNListResult
}

/** Extract the relative path from a full CDN URL. */
export function getCDNRelativePath(fullUrl: string): string | null {
  const prefix = `${CDN_URL}/uploads/`
  if (fullUrl.startsWith(prefix)) {
    return fullUrl.slice(prefix.length)
  }
  return null
}
