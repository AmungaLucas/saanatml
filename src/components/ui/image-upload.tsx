'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, ImageIcon, Loader2, X, FolderOpen } from 'lucide-react'
import { CDN_URL, type CDNFolder, type CDNFile } from '@/lib/cdn'

interface ImageUploadProps {
  /** Current image URL value */
  value: string
  /** Called when URL changes */
  onChange: (url: string) => void
  /** CDN folder for uploads */
  folder?: CDNFolder
  /** Label text */
  label?: string
  /** Preview aspect ratio class — default 'aspect-video' */
  previewClass?: string
  /** Whether to show a URL text input alongside the upload button */
  showUrlInput?: boolean
  /** Placeholder for URL input */
  placeholder?: string
  /** Additional class for the root wrapper */
  className?: string
}

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/avif'

export function ImageUpload({
  value,
  onChange,
  folder = 'misc',
  label = 'Image',
  previewClass = 'aspect-video',
  showUrlInput = true,
  placeholder = 'https://cdn.sanaathrumylens.co.ke/...',
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [cdnFiles, setCdnFiles] = useState<CDNFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── File upload handler ──────────────────────────────────
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif']
    if (!allowed.includes(file.type)) {
      setError('File type not allowed. Use JPEG, PNG, GIF, WebP, SVG, or AVIF.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum 10MB.')
      return
    }

    setUploading(true)
    setError('')

    try {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', folder)

      const res = await fetch('/api/cdn/upload', { method: 'POST', body: form })
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Upload failed')
      }

      onChange(json.data.url)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      // Reset file input so the same file can be re-selected
      if (fileRef.current) fileRef.current.value = ''
    }
  }, [folder, onChange])

  // ── CDN file browser ─────────────────────────────────────
  const loadCdnFiles = useCallback(async () => {
    setLoadingFiles(true)
    try {
      const res = await fetch(`/api/cdn/list?folder=${folder}&limit=30`)
      const json = await res.json()
      if (json.success) {
        setCdnFiles(json.data.files || [])
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingFiles(false)
    }
  }, [folder])

  const openPicker = useCallback(() => {
    setShowPicker(true)
    loadCdnFiles()
  }, [loadCdnFiles])

  // ── Render ───────────────────────────────────────────────
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-foreground mb-1.5">{label}</label>
      )}

      {/* Upload button row */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="gap-1.5 text-xs shrink-0"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? 'Uploading…' : 'Upload'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openPicker}
          disabled={uploading}
          className="gap-1.5 text-xs shrink-0"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          Browse CDN
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* URL text input */}
      {showUrlInput && (
        <div className="relative mt-2">
          <ImageIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="font-mono text-xs pl-8 pr-8"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              title="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <X className="h-3 w-3" /> {error}
        </p>
      )}

      {/* Preview */}
      {value && (
        <div className={`mt-2 rounded-lg overflow-hidden border border-border ${previewClass} bg-secondary relative group`}>
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* CDN File Picker Dialog */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPicker(false)}>
          <div
            className="bg-background border border-border rounded-xl shadow-2xl w-[90vw] max-w-2xl max-h-[70vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-serif text-base font-semibold">CDN Library — {folder}</h3>
              <button onClick={() => setShowPicker(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {loadingFiles ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : cdnFiles.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-12">No files in this folder.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {cdnFiles.map(file => (
                    <button
                      key={file.path}
                      onClick={() => { onChange(file.url); setShowPicker(false) }}
                      className={`rounded-lg overflow-hidden border-2 aspect-square bg-secondary hover:border-primary transition-colors ${value === file.url ? 'border-primary' : 'border-transparent'}`}
                      title={file.filename}
                    >
                      <img src={file.url} alt={file.filename} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}