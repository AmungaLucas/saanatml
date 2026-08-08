'use client'

import { useState, useCallback, useMemo } from 'react'
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

  const wc = useMemo(() => wordCount(content), [content])
  const autoReadTime = useMemo(() => estReadTime(wc), [wc])
  const tagList = useMemo(() => tags.split(',').map(t => t.trim()).filter(Boolean), [tags])

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
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setParsing(true)
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
    setParsing(false); e.target.value = ''
  }

  // ── Inner form content (shared between dialog & page) ──────
  const formContent = (
    <div className={variant === 'dialog' ? '' : 'max-w-6xl mx-auto'}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold">
          {mode === 'edit' ? 'Edit Article' : 'New Article'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === 'edit' ? 'Update and republish your story' : 'Write and publish a new story'}
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="space-y-5 min-w-0">
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
              className="w-full text-2xl lg:text-3xl font-serif font-bold bg-transparent border-0 border-b border-transparent focus:border-border outline-none placeholder:text-muted-foreground/40 py-2 transition-colors"
            />
          </div>

          {/* Slug */}
          <div className="flex items-center gap-2">
            <LinkIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-[11px] font-mono text-muted-foreground/60 shrink-0 hidden sm:inline">sanaathrumylens.co.ke/articles/</span>
            <input
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="article-slug"
              className="flex-1 font-mono text-sm bg-transparent border-0 border-b border-transparent focus:border-border outline-none placeholder:text-muted-foreground/40 py-1 min-w-0 transition-colors"
            />
          </div>

          {/* Excerpt */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-muted-foreground">Excerpt</label>
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
            <Tabs value={mdTab} onValueChange={setMdTab} className="rounded-xl border overflow-hidden">
              <TabsList className="w-full rounded-none border-b bg-transparent h-10 px-0">
                <TabsTrigger value="write" className="flex-1 gap-1.5 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                  <Pencil className="h-3 w-3" /> Write
                </TabsTrigger>
                <TabsTrigger value="split" className="flex-1 gap-1.5 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                  <Split className="h-3 w-3" /> Split
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex-1 gap-1.5 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                  <Eye className="h-3 w-3" /> Preview
                  <span className="font-mono text-[9px] text-muted-foreground">{wc.toLocaleString()} words</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="write" className="mt-0">
                <Textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Start writing your article…"
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

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="space-y-5">
          {/* Publishing card */}
          <div className="rounded-2xl border border-border p-5 space-y-4">
            <h3 className="text-sm font-semibold">Publishing</h3>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">Category</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
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
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">Author</label>
              <Select value={authorId} onValueChange={setAuthorId}>
                <SelectTrigger><SelectValue placeholder="Select author" /></SelectTrigger>
                <SelectContent>
                  {authors.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} <span className="text-muted-foreground">({a.role})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">Read Time</label>
              <div className="flex items-center gap-2">
                <Input type="number" min={1} max={60} value={readTime} onChange={e => setReadTime(e.target.value)} className="w-20 font-mono text-sm" />
                <span className="text-xs text-muted-foreground">min</span>
              </div>
            </div>

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

          {/* Tags card */}
          <div className="rounded-2xl border border-border p-5 space-y-3">
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

          {/* File import card */}
          {mode === 'create' && (
            <div className="rounded-2xl border border-border p-5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" /> Import Content
              </h3>
              <div className="relative border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors">
                <input type="file" accept=".docx,.pdf,.doc,.txt" onChange={handleFileUpload} disabled={parsing}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                <div className="flex flex-col items-center gap-1.5">
                  {parsing ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Upload className="h-4 w-4 text-muted-foreground" />}
                  <p className="text-xs font-medium">{parsing ? 'Parsing…' : 'Drop DOCX, PDF, or TXT'}</p>
                  <p className="text-[9px] font-mono text-muted-foreground/60">Extracts title, excerpt, content &amp; tags</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats card */}
          <div className="rounded-2xl bg-muted/40 p-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-mono text-sm font-semibold">{wc.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">words</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-mono text-sm font-semibold">~{autoReadTime}</p>
                <p className="text-[10px] text-muted-foreground">min read</p>
              </div>
            </div>
          </div>

          {/* Action buttons — sticky on desktop */}
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
