'use client'

import { useState, useMemo, useRef, useCallback, type KeyboardEvent } from 'react'
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
  Pencil, Eye, Send, Loader2, Upload, FileText, Star, Pin,
  Clock, X, CheckCircle2, RotateCcw,
  Bold, Italic, Heading2, Heading3, Link, Image as ImageLucide,
  ListOrdered, List, Quote, Code, Minus,
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
  variant?: 'dialog' | 'page'
  hideAuthor?: boolean
  defaultAuthorId?: string
}

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
const wordCount = (t: string) => t.trim().split(/\s+/).filter(Boolean).length
const estReadTime = (w: number) => Math.max(1, Math.ceil(w / 200))

const FIELD_LABEL = 'text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block'

// ── Markdown toolbar actions ────────────────────────────────────

type InsertFn = (textarea: HTMLTextAreaElement, val: string) => void

interface ToolbarAction {
  icon: React.ReactNode
  label: string
  insert: InsertFn
}

const wrapSelection = (before: string, after: string, placeholder?: string): InsertFn =>
  (ta, _val) => {
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = ta.value.slice(start, end) || placeholder || ''
    const replacement = `${before}${selected}${after}`
    // Use native input setter to trigger React's onChange
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set!
    nativeInputValueSetter.call(ta, ta.value.slice(0, start) + replacement + ta.value.slice(end))
    ta.dispatchEvent(new Event('input', { bubbles: true }))
    ta.focus()
    // Place cursor inside the markers
    const cursorPos = start + before.length + selected.length
    ta.setSelectionRange(cursorPos, cursorPos)
  }

const insertAtLineStart = (prefix: string): InsertFn =>
  (ta, _val) => {
    const start = ta.selectionStart
    const lineStart = ta.value.lastIndexOf('\n', start - 1) + 1
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set!
    nativeInputValueSetter.call(ta, ta.value.slice(0, lineStart) + prefix + ta.value.slice(lineStart))
    ta.dispatchEvent(new Event('input', { bubbles: true }))
    ta.focus()
    ta.setSelectionRange(start + prefix.length, start + prefix.length)
  }

const insertBlock = (block: string): InsertFn =>
  (ta, _val) => {
    const start = ta.selectionStart
    const before = ta.value.slice(0, start)
    const needsNewline = before.length > 0 && !before.endsWith('\n')
    const insert = (needsNewline ? '\n' : '') + block
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set!
    nativeInputValueSetter.call(ta, before + insert + ta.value.slice(start))
    ta.dispatchEvent(new Event('input', { bubbles: true }))
    ta.focus()
  }

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { label: 'Bold', icon: <Bold className="h-3.5 w-3.5" />, insert: wrapSelection('**', '**', 'bold text') },
  { label: 'Italic', icon: <Italic className="h-3.5 w-3.5" />, insert: wrapSelection('*', '*', 'italic text') },
  { label: 'Heading 2', icon: <Heading2 className="h-3.5 w-3.5" />, insert: insertAtLineStart('## ') },
  { label: 'Heading 3', icon: <Heading3 className="h-3.5 w-3.5" />, insert: insertAtLineStart('### ') },
  { label: 'Link', icon: <Link className="h-3.5 w-3.5" />, insert: wrapSelection('[', '](url)', 'link text') },
  { label: 'Image', icon: <ImageLucide className="h-3.5 w-3.5" />, insert: insertBlock('![alt](https://cdn.sanaathrumylens.co.ke/posts/image.jpg)\n') },
  { label: 'Ordered List', icon: <ListOrdered className="h-3.5 w-3.5" />, insert: insertAtLineStart('1. ') },
  { label: 'Unordered List', icon: <List className="h-3.5 w-3.5" />, insert: insertAtLineStart('- ') },
  { label: 'Quote', icon: <Quote className="h-3.5 w-3.5" />, insert: insertAtLineStart('> ') },
  { label: 'Code', icon: <Code className="h-3.5 w-3.5" />, insert: wrapSelection('`', '`', 'code') },
  { label: 'Divider', icon: <Minus className="h-3.5 w-3.5" />, insert: insertBlock('\n---\n') },
]

// ── Markdown Toolbar Component ─────────────────────────────────

function MdToolbar({ textareaRef }: { textareaRef: React.RefObject<HTMLTextAreaElement | null> }) {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto border-b bg-muted/20 px-2 py-1.5 shrink-0">
      {TOOLBAR_ACTIONS.map(action => (
        <button
          key={action.label}
          type="button"
          title={action.label}
          onClick={() => {
            const ta = textareaRef.current
            if (ta) action.insert(ta, '')
          }}
          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {action.icon}
        </button>
      ))}
      <div className="w-px h-5 bg-border mx-1 shrink-0" />
      <span className="text-[10px] font-mono text-muted-foreground/60 whitespace-nowrap px-1">Markdown</span>
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────

export function ArticleForm({
  initialData = {},
  onSubmit, onCancel,
  mode,
  categories, authors,
  variant = 'dialog',
  hideAuthor = false,
  defaultAuthorId,
}: ArticleFormProps) {
  const [title, setTitle] = useState(initialData.title || '')
  const [slug, setSlug] = useState(initialData.slug || '')
  const [excerpt, setExcerpt] = useState(initialData.excerpt || '')
  const [content, setContent] = useState(initialData.content || '')
  const [coverImage, setCoverImage] = useState(initialData.coverImage || '')
  const [categoryId, setCategoryId] = useState(initialData.categoryId || '')
  const [authorId, setAuthorId] = useState(initialData.authorId || defaultAuthorId || '')
  const [readTime, setReadTime] = useState(initialData.readTime || '5')
  const [tags, setTags] = useState(initialData.tags || '')
  const [featured, setFeatured] = useState(initialData.isFeatured || false)
  const [pinned, setPinned] = useState(initialData.isPinned || false)
  const [saving, setSaving] = useState(false)
  const [mdTab, setMdTab] = useState('write')
  const [parsing, setParsing] = useState(false)
  const [parsedFileName, setParsedFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const wc = useMemo(() => wordCount(content), [content])
  const autoReadTime = useMemo(() => estReadTime(wc), [wc])
  const tagList = useMemo(() => tags.split(',').map(t => t.trim()).filter(Boolean), [tags])

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

  const canSubmit = title && slug && categoryId && (hideAuthor || authorId)

  const handleSubmit = async () => {
    if (!canSubmit || saving) return
    setSaving(true)
    try {
      await onSubmit({
        title, slug, excerpt, content, coverImage,
        categoryId, authorId, readTime, tags,
        isFeatured: featured, isPinned: pinned,
      })
    } catch { /* caller handles */ }
    setSaving(false)
  }

  // ── File import ────────────────────────────────────────
  const processFile = useCallback(async (file: File) => {
    setParsing(true)
    setParsedFileName(file.name)
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    await processFile(file)
    e.target.value = ''
  }

  const handleDocDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(true) }, [])
  const handleDocDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false) }, [])
  const handleDocDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) await processFile(file)
  }, [processFile])

  const clearImport = () => {
    setContent(''); setTitle(''); setExcerpt(''); setTags(''); setParsedFileName(null)
  }

  // ── Form ───────────────────────────────────────────────
  const formContent = (
    <div className={variant === 'dialog' ? 'px-1' : 'max-w-4xl mx-auto'}>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold">
            {mode === 'edit' ? 'Edit Article' : 'New Article'}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {mode === 'edit' ? 'Update your story' : 'Write and publish a new story'}
          </p>
        </div>
        {content && (
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
            <span className="font-mono">{wc.toLocaleString()} words</span>
            <span className="font-mono">~{autoReadTime} min</span>
          </div>
        )}
      </div>

      {/* Two-column: main fields | sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* ═══ LEFT ═══ */}
        <div className="space-y-4 min-w-0">

          {/* Upload Document (create mode only) */}
          {mode === 'create' && (
            <div>
              <label className={FIELD_LABEL}>Upload Document</label>
              {/* After successful parse — show file info, not blank dropzone */}
              {parsedFileName && !parsing ? (
                <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 dark:border-green-900/60 dark:bg-green-950/20 px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{parsedFileName}</p>
                    <p className="text-[11px] text-green-700/70 dark:text-green-400/70">Content imported successfully</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline shrink-0"
                  >
                    <RotateCcw className="h-3 w-3" /> Replace
                  </button>
                  <button
                    type="button"
                    onClick={clearImport}
                    className="text-xs text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={handleDocDragOver}
                  onDragLeave={handleDocDragLeave}
                  onDrop={handleDocDrop}
                  onClick={() => !parsing && fileInputRef.current?.click()}
                  className={`relative flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3 cursor-pointer transition-colors
                    ${parsing ? 'border-primary/50 bg-primary/5' : dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}
                  `}
                >
                  {parsing
                    ? <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
                    : <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {parsing ? 'Parsing document…' : 'Drop a file here or click to browse'}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">DOCX, PDF, TXT — extracts title, content & metadata</p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md shrink-0">
                    .docx .pdf .txt
                  </span>
                </div>
              )}
              <input
                ref={fileInputRef} type="file" accept=".docx,.pdf,.doc,.txt"
                onChange={handleFileChange} disabled={parsing} className="hidden"
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className={FIELD_LABEL}>Title</label>
            <input
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Article title…"
              className="w-full text-xl font-serif font-bold bg-transparent border-b-2 border-border/60 focus:border-primary rounded-none outline-none placeholder:text-muted-foreground/40 py-2 transition-colors"
            />
          </div>

          {/* Slug + Read Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={FIELD_LABEL}>Slug</label>
              <Input
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="article-slug"
                className="font-mono text-sm"
              />
            </div>
            <div>
              <label className={FIELD_LABEL}>
                Read Time <span className="normal-case tracking-normal text-muted-foreground/50 font-normal">(auto ~{autoReadTime} min)</span>
              </label>
              <div className="flex items-center gap-2">
                <Input type="number" min={1} max={60} value={readTime} onChange={e => setReadTime(e.target.value)} className="font-mono text-sm" />
                <span className="text-xs text-muted-foreground shrink-0">min</span>
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={FIELD_LABEL + ' !mb-0'}>Excerpt</label>
              <span className="text-[10px] font-mono text-muted-foreground/50">{excerpt.length}/300</span>
            </div>
            <Textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value.slice(0, 300))}
              placeholder="Brief summary for article cards and SEO…"
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          {/* Content Editor — fixed height with scroll */}
          <div>
            <Tabs value={mdTab} onValueChange={setMdTab} className="rounded-xl border overflow-hidden">
              <TabsList className="w-full rounded-none border-b bg-muted/20 h-10 px-0">
                <TabsTrigger value="write" className="flex-1 gap-1.5 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                  <Pencil className="h-3 w-3" /> Write
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex-1 gap-1.5 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                  <Eye className="h-3 w-3" /> Preview
                  <span className="font-mono text-[9px] text-muted-foreground">{wc}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="write" className="mt-0 flex flex-col">
                <MdToolbar textareaRef={textareaRef} />
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Start writing your article in markdown…"
                  className="rounded-none border-0 font-mono text-sm resize-none h-[50vh] max-h-[500px] min-h-[250px] focus-visible:ring-0"
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <div className="h-[50vh] max-h-[500px] min-h-[250px] overflow-y-auto">
                  <div className="prose prose-sm dark:prose-invert max-w-none p-4">
                    {content
                      ? <ReactMarkdown>{content}</ReactMarkdown>
                      : <p className="text-muted-foreground italic text-sm">Nothing to preview yet…</p>
                    }
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Cover Image — below the editor */}
          <div>
            <label className={FIELD_LABEL}>Cover Image</label>
            <ImageUpload value={coverImage} onChange={setCoverImage} folder="posts" variant="cover" />
          </div>
        </div>

        {/* ═══ RIGHT SIDEBAR ═══ */}
        <div className="space-y-4">
          {/* Publishing */}
          <div className="rounded-xl border p-4 space-y-4">
            <h3 className="text-sm font-semibold">Publishing</h3>

            <div>
              <label className={FIELD_LABEL}>Category</label>
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

            {/* Author — hidden for editors who are auto-assigned */}
            {!hideAuthor && (
            <div>
              <label className={FIELD_LABEL}>Author</label>
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
            )}

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <Star className={`h-4 w-4 ${featured ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                <span className="text-sm">Featured</span>
              </div>
              <Switch checked={featured} onCheckedChange={setFeatured} />
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <Pin className={`h-4 w-4 ${pinned ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-sm">Pinned</span>
              </div>
              <Switch checked={pinned} onCheckedChange={setPinned} />
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-xl border p-4 space-y-3">
            <h3 className="text-sm font-semibold">Tags</h3>
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

          {/* Stats */}
          <div className="rounded-xl bg-muted/40 p-3 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="font-mono text-sm font-semibold leading-none">{wc.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">words</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="font-mono text-sm font-semibold leading-none">~{autoReadTime}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">min read</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="lg:sticky lg:bottom-4">
            <div className="flex items-center gap-2 rounded-xl border bg-background/95 backdrop-blur-sm p-3">
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || saving}
                className="flex-1 gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {saving ? 'Saving…' : mode === 'edit' ? 'Update' : 'Publish'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (variant === 'dialog') {
    return <div className="max-h-[90vh] overflow-y-auto">{formContent}</div>
  }

  return formContent
}
