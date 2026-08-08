'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Pencil, Eye, Split, Send, Loader2, Upload, FileText, Star, Pin,
  Link as LinkIcon, Clock, X, ImageIcon,
  FileUp, ArrowRight, CheckCircle2, ChevronDown, ChevronUp,
  Type, Hash, Image as ImageLucide, Settings2,
} from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'
import ReactMarkdown from 'react-markdown'

// ── Types ──────────────────────────────────────────────────────

interface CategoryOption { id: string; name: string; color: string }
interface AuthorOption { id: string; name: string; role: string }

export interface ArticleFormData {
  title: string; slug: string; excerpt: string; content: string
  coverImage: string; categoryId: string; authorId: string
  readTime: string; tags: string; isFeatured: boolean; isPinned: boolean
}

interface ArticleFormProps {
  initialData?: Partial<ArticleFormData>
  onSubmit: (data: ArticleFormData) => Promise<void>
  onCancel: () => void
  mode: 'create' | 'edit'
  categories: CategoryOption[]
  authors: AuthorOption[]
  /** 'dialog' = inside a Dialog (max-w-6xl), 'page' = full page */
  variant?: 'dialog' | 'page'
}

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
const wordCount = (t: string) => t.trim().split(/\s+/).filter(Boolean).length
const estReadTime = (w: number) => Math.max(1, Math.ceil(w / 200))

const FILE_ICONS: Record<string, string> = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'application/msword': 'doc',
}

const FILE_COLORS: Record<string, string> = {
  docx: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  pdf: 'bg-red-500/10 text-red-600 dark:text-red-400',
  doc: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  txt: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400',
}

// ── Component ──────────────────────────────────────────────────

export function ArticleForm({
  initialData = {},
  onSubmit, onCancel,
  mode,
  categories, authors,
  variant = 'dialog',
}: ArticleFormProps) {
  // ── State ─────────────────────────────────────────────────
  const [title, setTitle] = useState(initialData.title || '')
  const [slug, setSlug] = useState(initialData.slug || '')
  const [excerpt, setExcerpt] = useState(initialData.excerpt || '')
  const [content, setContent] = useState(initialData.content || '')
  const [coverImage, setCoverImage] = useState(initialData.coverImage || '')
  const [categoryId, setCategoryId] = useState(initialData.categoryId || '')
  const [authorId, setAuthorId] = useState(initialData.authorId || '')
  const [readTime, setReadTime] = useState(initialData.readTime || '5')
  const [tags, setTags] = useState(initialData.tags || '')
  const [featured, setFeatured] = useState(initialData.isFeatured || false)
  const [pinned, setPinned] = useState(initialData.isPinned || false)
  const [saving, setSaving] = useState(false)
  const [mdTab, setMdTab] = useState('write')
  const [parsing, setParsing] = useState(false)
  const [parsedFileName, setParsedFileName] = useState<string | null>(null)
  const [parsedFileType, setParsedFileType] = useState<string>('')
  const [sidebarSections, setSidebarSections] = useState({
    publish: true, tags: true, options: true,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [docDragOver, setDocDragOver] = useState(false)

  const wc = useMemo(() => wordCount(content), [content])
  const autoReadTime = useMemo(() => estReadTime(wc), [wc])
  const tagList = useMemo(() => tags.split(',').map(t => t.trim()).filter(Boolean), [tags])

  // Whether the form has content (to decide if we show the upload hero or the editor)
  const hasContent = !!(content || title)

  // ── Helpers ───────────────────────────────────────────────
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (mode === 'create') setSlug(slugify(val))
  }

  const removeTag = (idx: number) => {
    const list = [...tagList]; list.splice(idx, 1)
    setTags(list.join(', '))
  }

  const handleTagsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const input = e.currentTarget
      const val = input.value.trim()
      if (val && !tagList.includes(val)) {
        setTags(prev => prev ? `${prev}, ${val}` : val)
      }
      input.value = ''
    }
  }

  const canSubmit = title && slug && categoryId && authorId

  const handleSubmit = async () => {
    if (!canSubmit || saving) return
    setSaving(true)
    try {
      await onSubmit({
        title, slug, excerpt, content, coverImage,
        categoryId, authorId, readTime, tags,
        isFeatured: featured, isPinned: pinned,
      })
    } catch { /* caller handles errors */ }
    setSaving(false)
  }

  // ── File import ────────────────────────────────────────────
  const processFile = useCallback(async (file: File) => {
    setParsing(true)
    setParsedFileName(file.name)
    const ext = FILE_ICONS[file.type] || 'txt'
    setParsedFileType(ext)
    try {
      const form = new FormData(); form.append('file', file)
      const res = await fetch('/api/admin/parse-file', { method: 'POST', body: form })
      const json = await res.json()
      if (json.markdown) setContent(json.markdown)
      if (json.titleHint && !title) handleTitleChange(json.titleHint)
      if (json.excerpt && !excerpt) setExcerpt(json.excerpt)
      if (json.readTime) setReadTime(String(json.readTime))
      if (json.tags) setTags(prev => prev ? `${prev}, ${json.tags}` : json.tags)
    } catch { /* silent */ }
    setParsing(false)
  }, [title, excerpt, handleTitleChange])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    await processFile(file)
    e.target.value = ''
  }

  // Document drag & drop
  const handleDocDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDocDragOver(true) }, [])
  const handleDocDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setDocDragOver(false) }, [])
  const handleDocDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); setDocDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && FILE_ICONS[file.type]) {
      await processFile(file)
    }
  }, [processFile])

  // ── Inner form content (shared between dialog & page) ──────
  const formContent = (
    <div className={variant === 'dialog' ? '' : 'max-w-7xl mx-auto'}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold">
            {mode === 'edit' ? 'Edit Article' : 'New Article'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mode === 'edit' ? 'Update and republish your story' : 'Start with a document or write from scratch'}
          </p>
        </div>
        {/* Word count pill in header */}
        {hasContent && (
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-mono"><FileText className="h-3.5 w-3.5" />{wc.toLocaleString()} words</span>
            <span className="flex items-center gap-1 font-mono"><Clock className="h-3.5 w-3.5" />~{autoReadTime} min read</span>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          HERO: Document Upload (create mode, when no content yet)
         ══════════════════════════════════════════════════════ */}
      {mode === 'create' && !hasContent && (
        <div className="mb-8">
          <div
            onDragOver={handleDocDragOver}
            onDragLeave={handleDocDragLeave}
            onDrop={handleDocDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
              ${parsing
                ? 'border-primary/60 bg-primary/5'
                : docDragOver
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-border/80 hover:border-primary/40 bg-card'
              }`
            }
          >
            <div className="py-16 px-8 flex flex-col items-center justify-center gap-4">
              {parsing ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold">Parsing your document…</p>
                    {parsedFileName && (
                      <p className="text-sm text-muted-foreground mt-1 font-mono">{parsedFileName}</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                    <FileUp className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">Upload a document to get started</p>
                    <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
                      Drop your DOCX, PDF, or TXT file here. We'll extract the title, content, and metadata automatically.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    {['DOCX', 'PDF', 'TXT'].map(fmt => (
                      <span key={fmt} className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold ${FILE_COLORS[fmt.toLowerCase()]}`}>
                        .{fmt}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Button size="sm" className="gap-2">
                      <Upload className="h-4 w-4" /> Choose File
                    </Button>
                    <span className="text-xs text-muted-foreground">or drag & drop</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Parsed success banner */}
          {parsedFileName && !parsing && hasContent && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 px-5 py-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Imported from <span className="font-mono">{parsedFileName}</span>
                </p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-0.5">
                  Title, content, excerpt & tags extracted. Review and fill in the details below.
                </p>
              </div>
              <button
                onClick={() => { setContent(''); setTitle(''); setExcerpt(''); setTags(''); setParsedFileName(null) }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                Undo
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.pdf,.doc,.txt"
            onChange={handleFileUpload}
            disabled={parsing}
            className="hidden"
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MAIN FORM: Two-column layout (visible when editing or
          when create mode has content)
         ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="space-y-5 min-w-0">
          {/* Parsed success banner (when already has content) */}
          {mode === 'create' && parsedFileName && (
            <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 px-5 py-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Imported from <span className="font-mono">{parsedFileName}</span>
                </p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-0.5">
                  Review the extracted content below. You can upload a different file to replace it.
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={parsing}
                className="text-xs text-primary font-medium hover:underline shrink-0 disabled:opacity-50"
              >
                {parsing ? 'Parsing…' : 'Replace file'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.pdf,.doc,.txt"
                onChange={handleFileUpload}
                disabled={parsing}
                className="hidden"
              />
            </div>
          )}

          {/* Cover Image */}
          <ImageUpload
            value={coverImage}
            onChange={setCoverImage}
            folder="posts"
            variant="cover"
          />

          {/* Title */}
          <div>
            <input
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Article title…"
              className="w-full text-2xl lg:text-3xl font-serif font-bold bg-transparent border-0 border-b-2 border-transparent focus:border-border outline-none placeholder:text-muted-foreground/40 py-2 transition-colors"
            />
          </div>

          {/* Slug + Excerpt row on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-5">
            {/* Slug */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">URL Slug</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-muted-foreground/50 shrink-0 hidden sm:inline">/articles/</span>
                <input
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="article-slug"
                  className="flex-1 font-mono text-sm bg-muted/30 rounded-lg px-3 py-2 border border-transparent focus:border-border outline-none placeholder:text-muted-foreground/40 min-w-0 transition-colors"
                />
              </div>
            </div>

            {/* Read Time */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Read Time</span>
                <span className="text-[10px] font-mono text-muted-foreground/50 ml-auto">auto: ~{autoReadTime} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number" min={1} max={60}
                  value={readTime}
                  onChange={e => setReadTime(e.target.value)}
                  className="font-mono text-sm bg-muted/30"
                />
                <span className="text-xs text-muted-foreground shrink-0">minutes</span>
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Type className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Excerpt</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/50">{excerpt.length}/300</span>
            </div>
            <Textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value.slice(0, 300))}
              placeholder="A brief summary that appears in article cards and SEO…"
              rows={3}
              className="bg-muted/30 rounded-xl text-sm resize-none"
            />
          </div>

          {/* Content Editor */}
          <div>
            <Tabs value={mdTab} onValueChange={setMdTab} className="rounded-2xl border overflow-hidden bg-card">
              <TabsList className="w-full rounded-none border-b bg-muted/30 h-11 px-2">
                <TabsTrigger value="write" className="flex-1 gap-1.5 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Pencil className="h-3.5 w-3.5" /> Write
                </TabsTrigger>
                <TabsTrigger value="split" className="flex-1 gap-1.5 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Split className="h-3.5 w-3.5" /> Split
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex-1 gap-1.5 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Eye className="h-3.5 w-3.5" /> Preview
                  <span className="font-mono text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">{wc.toLocaleString()}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="write" className="mt-0">
                <Textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Start writing your article in markdown…"
                  className="rounded-none border-0 font-mono text-sm resize-y min-h-[500px] focus-visible:ring-0"
                />
              </TabsContent>

              <TabsContent value="split" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-x">
                  <Textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Markdown…"
                    className="rounded-none border-0 font-mono text-sm resize-none min-h-[500px] focus-visible:ring-0"
                  />
                  <ScrollArea className="max-h-[500px]">
                    <div className="prose prose-sm dark:prose-invert max-w-none p-4">
                      {content ? <ReactMarkdown>{content}</ReactMarkdown> : <p className="text-muted-foreground italic">Nothing to preview…</p>}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <ScrollArea className="max-h-[600px]">
                  <div className="prose prose-sm dark:prose-invert max-w-none p-4">
                    {content ? <ReactMarkdown>{content}</ReactMarkdown> : <p className="text-muted-foreground italic">Nothing to preview yet…</p>}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* ═══ RIGHT SIDEBAR ═══ */}
        <div className="space-y-4">
          {/* ── Publishing Section ── */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <button
              type="button"
              onClick={() => setSidebarSections(s => ({ ...s, publish: !s.publish }))}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
            >
              <span className="text-sm font-semibold">Publishing</span>
              {sidebarSections.publish
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />
              }
            </button>
            {sidebarSections.publish && (
              <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1.5">Category</label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                            {c.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1.5">Author</label>
                  <Select value={authorId} onValueChange={setAuthorId}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select author" /></SelectTrigger>
                    <SelectContent>
                      {authors.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name} <span className="text-muted-foreground">({a.role})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* ── Tags Section ── */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <button
              type="button"
              onClick={() => setSidebarSections(s => ({ ...s, tags: !s.tags }))}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
            >
              <span className="text-sm font-semibold">Tags</span>
              {sidebarSections.tags
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />
              }
            </button>
            {sidebarSections.tags && (
              <div className="px-5 pb-5 space-y-3 border-t border-border pt-4">
                {tagList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tagList.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 text-xs pr-1">
                        {tag}
                        <button onClick={() => removeTag(i)} className="ml-0.5 hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
                      </Badge>
                    ))}
                  </div>
                )}
                <Input
                  placeholder="Type and press Enter to add…"
                  className="text-sm"
                  defaultValue={''}
                  onKeyDown={handleTagsKeyDown}
                />
              </div>
            )}
          </div>

          {/* ── Options Section ── */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <button
              type="button"
              onClick={() => setSidebarSections(s => ({ ...s, options: !s.options }))}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
            >
              <span className="text-sm font-semibold">Options</span>
              {sidebarSections.options
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />
              }
            </button>
            {sidebarSections.options && (
              <div className="px-5 pb-5 space-y-3 border-t border-border pt-4">
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2.5">
                    <Star className={`h-4 w-4 ${featured ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                    <div>
                      <span className="text-sm">Featured</span>
                      <p className="text-[10px] text-muted-foreground">Show in featured section</p>
                    </div>
                  </div>
                  <Switch checked={featured} onCheckedChange={setFeatured} />
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2.5">
                    <Pin className={`h-4 w-4 ${pinned ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <span className="text-sm">Pinned</span>
                      <p className="text-[10px] text-muted-foreground">Stick to top of listings</p>
                    </div>
                  </div>
                  <Switch checked={pinned} onCheckedChange={setPinned} />
                </div>
              </div>
            )}
          </div>

          {/* ── Upload Another (create mode, when has content) ── */}
          {mode === 'create' && hasContent && !parsedFileName && (
            <div className="rounded-2xl border border-dashed border-border p-4">
              <div
                className="relative border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.pdf,.doc,.txt"
                  onChange={handleFileUpload}
                  disabled={parsing}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex flex-col items-center gap-1.5">
                  {parsing
                    ? <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    : <Upload className="h-5 w-5 text-muted-foreground" />
                  }
                  <p className="text-xs font-medium">{parsing ? 'Parsing…' : 'Import from DOCX, PDF, or TXT'}</p>
                  <p className="text-[9px] font-mono text-muted-foreground/60">Extracts title, excerpt, content & tags</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Stats ── */}
          <div className="rounded-2xl bg-muted/40 p-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-mono text-sm font-semibold leading-none">{wc.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">words</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-mono text-sm font-semibold leading-none">~{autoReadTime}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">min read</p>
              </div>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="lg:sticky lg:bottom-4 pt-2">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/95 backdrop-blur-sm p-4">
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || saving}
                className="flex-1 gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {saving ? 'Saving…' : mode === 'edit' ? 'Update Article' : 'Publish Article'}
              </Button>
              <Button variant="ghost" onClick={onCancel} className="text-xs">Cancel</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Render: Dialog vs Page ─────────────────────────────────
  if (variant === 'dialog') {
    return (
      <div className="max-h-[90vh] overflow-y-auto">
        {formContent}
      </div>
    )
  }

  return formContent
}