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

      {/* CDN File Picker — z-[100] to escape parent Dialog overlay */}
      {showPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowPicker(false)}>
          <div
            className="bg-background border border-border rounded-2xl shadow-2xl w-[92vw] max-w-3xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-serif text-lg font-semibold">CDN Media Library</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Select an image or upload a new one</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  Upload New
                </button>
                <button onClick={() => setShowPicker(false)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loadingFiles ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading media…
                </div>
              ) : cdnFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No files in this folder.</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Upload an image to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {cdnFiles.map(file => (
                    <button
                      key={file.path}
                      onClick={() => { onChange(file.url); setShowPicker(false) }}
                      className={`group relative rounded-xl overflow-hidden border-2 aspect-square bg-secondary hover:border-primary/70 transition-all ${value === file.url ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}
                      title={file.filename}
                    >
                      <img src={file.url} alt={file.filename} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                        <span className="w-full px-2 py-1.5 text-[10px] font-mono text-white truncate opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
                          {file.filename}
                        </span>
                      </div>
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