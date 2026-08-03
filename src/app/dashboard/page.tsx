'use client'

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FileText, ArrowLeft, Eye, Pencil, Plus, Calendar,
  MapPin, ExternalLink, Send, Loader2, CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

// ── Interfaces ──────────────────────────────────────────────

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  publishedAt: string
  views: number
  readTime: number
  tags: string
  isFeatured: boolean
  isPinned: boolean
  category: { name: string; color: string }
  author: { name: string; id: string }
  commentCount: number
}

interface CategoryItem {
  id: string
  name: string
  slug: string
  description: string
  color: string
}

interface AuthorItem {
  id: string
  name: string
  slug: string
  bio: string
  avatar: string
  role: string
}

interface EventItem {
  id: string
  title: string
  description: string
  date: string
  endDate: string | null
  venue: string
  city: string
  category: string
  imageUrl: string
  ticketUrl: string
  isFeatured: boolean
  isPast: boolean
  categoryRef: { name: string; color: string } | null
}

// ── Helpers ─────────────────────────────────────────────────

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

const fmtEventDate = (iso: string, endDate: string | null) => {
  const d = new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
  if (endDate) {
    const e = new Date(endDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
    return `${d} – ${e}`
  }
  return d
}

const labelCls = 'font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5'
const thCls = 'text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground'
const tdCls = 'px-4 py-3'

// ── Component ───────────────────────────────────────────────

export default function EditorDashboard() {
  const [activeTab, setActiveTab] = useState<string>('articles')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Data
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [authors, setAuthors] = useState<AuthorItem[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  // New article form
  const [formTitle, setFormTitle] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formExcerpt, setFormExcerpt] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formCoverImage, setFormCoverImage] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formAuthorId, setFormAuthorId] = useState('')
  const [formTags, setFormTags] = useState('')
  const [formReadTime, setFormReadTime] = useState('5')
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Edit dialog
  const [editDialog, setEditDialog] = useState(false)
  const [editArticle, setEditArticle] = useState<Article | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editExcerpt, setEditExcerpt] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editCoverImage, setEditCoverImage] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editAuthorId, setEditAuthorId] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editReadTime, setEditReadTime] = useState('5')
  const [editSaving, setEditSaving] = useState(false)

  // Markdown preview toggle
  const [mdTab, setMdTab] = useState<string>('write')
  const [editMdTab, setEditMdTab] = useState<string>('write')

  // ── Data Fetching ─────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [arts, cats, auths, evts] = await Promise.all([
        fetch('/api/admin/articles').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/authors').then(r => r.json()),
        fetch('/api/events').then(r => r.json()),
      ])
      setArticles(arts)
      setCategories(cats)
      setAuthors(auths)
      setEvents(evts)
    } catch (err) {
      console.error('Failed to fetch data', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Auto-slug from title ──────────────────────────────────

  const handleTitleChange = (val: string) => {
    setFormTitle(val)
    setFormSlug(slugify(val))
  }

  const handleEditTitleChange = (val: string) => {
    setEditTitle(val)
    setEditSlug(slugify(val))
  }

  // ── Create Article ────────────────────────────────────────

  const handleCreate = async () => {
    if (!formTitle || !formSlug || !formCategoryId || !formAuthorId) {
      setFormError('Title, slug, category, and author are required.')
      return
    }
    setFormError(null)
    setFormSaving(true)
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          slug: formSlug,
          excerpt: formExcerpt,
          content: formContent,
          coverImage: formCoverImage,
          categoryId: formCategoryId,
          authorId: formAuthorId,
          tags: formTags,
          readTime: parseInt(formReadTime) || 5,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create article')
      }
      // Reset form
      setFormTitle(''); setFormSlug(''); setFormExcerpt(''); setFormContent('')
      setFormCoverImage(''); setFormCategoryId(''); setFormAuthorId('')
      setFormTags(''); setFormReadTime('5')
      // Show success & switch tab
      setSuccessMsg('Article created successfully!')
      await fetchAll()
      setActiveTab('articles')
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormSaving(false)
    }
  }

  // ── Edit Article ──────────────────────────────────────────

  const openEdit = (article: Article) => {
    setEditArticle(article)
    setEditTitle(article.title)
    setEditSlug(article.slug)
    setEditExcerpt(article.excerpt)
    setEditContent(article.content)
    setEditCoverImage(article.coverImage)
    setEditCategoryId(article.category?.name ? categories.find(c => c.name === article.category.name)?.id || '' : '')
    setEditAuthorId(article.author?.id || '')
    setEditTags(article.tags)
    setEditReadTime(String(article.readTime))
    setEditDialog(true)
  }

  const handleEditSave = async () => {
    if (!editArticle || !editTitle || !editSlug || !editCategoryId || !editAuthorId) return
    setEditSaving(true)
    try {
      const res = await fetch(`/api/admin/articles/${editArticle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          slug: editSlug,
          excerpt: editExcerpt,
          content: editContent,
          coverImage: editCoverImage,
          categoryId: editCategoryId,
          authorId: editAuthorId,
          tags: editTags,
          readTime: parseInt(editReadTime) || 5,
        }),
      })
      if (!res.ok) throw new Error('Failed to update article')
      setEditDialog(false)
      setSuccessMsg('Article updated successfully!')
      await fetchAll()
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err) {
      console.error(err)
    } finally {
      setEditSaving(false)
    }
  }

  // ── Computed ──────────────────────────────────────────────

  const upcomingEvents = events
    .filter(e => !e.isPast && new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const totalViews = articles.reduce((sum, a) => sum + a.views, 0)

  // ── Word count ────────────────────────────────────────────

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-lg font-semibold tracking-tight">
              Sanaa <span className="text-muted-foreground">/ Editor Dashboard</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Admin</Link>
            <span className="text-border">|</span>
            <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/login' }} className="text-xs text-muted-foreground hover:text-destructive transition-colors">Logout</button>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Success Banner */}
      {successMsg && (
        <div className="border-b bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2.5">
          <div className="mx-auto flex max-w-6xl items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            {successMsg}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="articles" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              My Articles
            </TabsTrigger>
            <TabsTrigger value="new" className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              New Article
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-1.5 text-xs">
              <Calendar className="h-3.5 w-3.5" />
              Content Calendar
            </TabsTrigger>
          </TabsList>

          {/* ─── MY ARTICLES TAB ──────────────────────────────── */}
          <TabsContent value="articles">
            {/* Stats row */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Total Articles</p>
                <p className="mt-1 text-2xl font-semibold">{articles.length}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Total Views</p>
                <p className="mt-1 text-2xl font-semibold">{totalViews.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Categories</p>
                <p className="mt-1 text-2xl font-semibold">{new Set(articles.map(a => a.category?.name)).size}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Avg Views</p>
                <p className="mt-1 text-2xl font-semibold">
                  {articles.length ? Math.round(totalViews / articles.length).toLocaleString() : '0'}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading articles…
              </div>
            ) : articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No articles yet. Create your first article!</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-1.5"
                  onClick={() => setActiveTab('new')}
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Article
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className={thCls}>Title</th>
                      <th className={`${thCls} hidden sm:table-cell`}>Category</th>
                      <th className={`${thCls} hidden md:table-cell`}>Published</th>
                      <th className={`${thCls} hidden md:table-cell`}>Views</th>
                      <th className={thCls}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article) => (
                      <tr key={article.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                        <td className={tdCls}>
                          <div className="flex items-center gap-2">
                            {article.isFeatured && (
                              <Badge variant="secondary" className="shrink-0 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[9px] px-1.5">
                                Featured
                              </Badge>
                            )}
                            <span className="max-w-[200px] truncate font-medium lg:max-w-[300px]">
                              {article.title}
                            </span>
                          </div>
                        </td>
                        <td className={`${tdCls} hidden sm:table-cell`}>
                          {article.category && (
                            <Badge
                              variant="outline"
                              className="text-[10px]"
                              style={{ borderColor: article.category.color, color: article.category.color }}
                            >
                              {article.category.name}
                            </Badge>
                          )}
                        </td>
                        <td className={`${tdCls} hidden md:table-cell`}>
                          <span className="font-mono text-xs text-muted-foreground">
                            {fmtDate(article.publishedAt)}
                          </span>
                        </td>
                        <td className={`${tdCls} hidden md:table-cell`}>
                          <span className="flex items-center gap-1 font-mono text-xs">
                            <Eye className="h-3 w-3 text-muted-foreground" />
                            {article.views.toLocaleString()}
                          </span>
                        </td>
                        <td className={tdCls}>
                          <div className="flex items-center gap-1">
                            <Link href={`/articles/${article.slug}`} target="_blank">
                              <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                                <ExternalLink className="h-3 w-3" />
                                <span className="hidden sm:inline">View</span>
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 px-2 text-xs"
                              onClick={() => openEdit(article)}
                            >
                              <Pencil className="h-3 w-3" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* ─── NEW ARTICLE TAB ──────────────────────────────── */}
          <TabsContent value="new">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-6 font-serif text-2xl font-semibold">Create New Article</h2>

              {formError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className={labelCls}>Title *</label>
                  <Input
                    value={formTitle}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="Enter article title…"
                    className="font-serif text-base"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className={labelCls}>Slug *</label>
                  <Input
                    value={formSlug}
                    onChange={e => setFormSlug(e.target.value)}
                    placeholder="article-url-slug"
                    className="font-mono text-sm"
                  />
                </div>

                {/* Category + Author row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Category *</label>
                    <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                              {cat.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className={labelCls}>Author *</label>
                    <Select value={formAuthorId} onValueChange={setFormAuthorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select author" />
                      </SelectTrigger>
                      <SelectContent>
                        {authors.map(auth => (
                          <SelectItem key={auth.id} value={auth.id}>
                            {auth.name}{' '}
                            <span className="text-muted-foreground">({auth.role})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className={labelCls}>Excerpt</label>
                  <Textarea
                    value={formExcerpt}
                    onChange={e => setFormExcerpt(e.target.value)}
                    placeholder="A brief summary of the article…"
                    rows={3}
                  />
                </div>

                {/* Content with Markdown preview */}
                <div>
                  <label className={labelCls}>Content</label>
                  <Tabs value={mdTab} onValueChange={setMdTab} className="rounded-lg border">
                    <TabsList className="w-full rounded-none border-b bg-transparent px-0">
                      <TabsTrigger value="write" className="flex-1 gap-1.5 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                        <Pencil className="h-3 w-3" />
                        Write
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="flex-1 gap-1.5 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                        <Eye className="h-3 w-3" />
                        Preview
                        <span className="font-mono text-[9px] text-muted-foreground">
                          {wordCount(formContent)} words
                        </span>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="write" className="mt-0">
                      <Textarea
                        value={formContent}
                        onChange={e => setFormContent(e.target.value)}
                        placeholder="Write your article content in Markdown…"
                        rows={16}
                        className="rounded-none border-0 font-mono text-sm resize-y focus-visible:ring-0"
                      />
                    </TabsContent>
                    <TabsContent value="preview" className="mt-0">
                      <ScrollArea className="max-h-[420px]">
                        <div className="prose prose-sm dark:prose-invert max-w-none p-4">
                          {formContent ? (
                            <ReactMarkdown>{formContent}</ReactMarkdown>
                          ) : (
                            <p className="text-muted-foreground italic">Nothing to preview yet…</p>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Cover Image */}
                <div>
                  <label className={labelCls}>Cover Image URL</label>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <Input
                        value={formCoverImage}
                        onChange={e => setFormCoverImage(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="font-mono text-xs"
                      />
                    </div>
                    {formCoverImage && (
                      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md border bg-muted">
                        <img
                          src={formCoverImage}
                          alt="Cover preview"
                          className="h-full w-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags + Read Time row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Tags</label>
                    <Input
                      value={formTags}
                      onChange={e => setFormTags(e.target.value)}
                      placeholder="art, nairobi, exhibition (comma-separated)"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Read Time (minutes)</label>
                    <Input
                      type="number"
                      min={1}
                      max={60}
                      value={formReadTime}
                      onChange={e => setFormReadTime(e.target.value)}
                      className="font-mono text-sm w-24"
                    />
                  </div>
                </div>

                <Separator />

                {/* Submit */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleCreate}
                    disabled={formSaving}
                    className="gap-2"
                  >
                    {formSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {formSaving ? 'Publishing…' : 'Publish Article'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab('articles')}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ─── CONTENT CALENDAR TAB ─────────────────────────── */}
          <TabsContent value="calendar">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-2 font-serif text-2xl font-semibold">Content Calendar</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Upcoming events and happenings for story inspiration.
              </p>

              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading events…
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Calendar className="mb-3 h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No upcoming events at the moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const catName = event.categoryRef?.name || event.category
                    const catColor = event.categoryRef?.color || '#888'
                    return (
                      <div
                        key={event.id}
                        className="group relative rounded-lg border p-4 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                {fmtEventDate(event.date, event.endDate)}
                              </span>
                              {catName && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1.5"
                                  style={{ borderColor: catColor, color: catColor }}
                                >
                                  {catName}
                                </Badge>
                              )}
                              {event.isFeatured && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[9px] px-1.5">
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-serif text-base font-semibold">{event.title}</h3>
                            {event.description && (
                              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                {event.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              {(event.venue || event.city) && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {[event.venue, event.city].filter(Boolean).join(', ')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Date visual accent on desktop */}
                          <div className="hidden shrink-0 sm:block">
                            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-muted text-center">
                              <span className="text-lg font-bold leading-none">
                                {new Date(event.date).getDate()}
                              </span>
                              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                                {new Date(event.date).toLocaleDateString('en-KE', { month: 'short' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* ─── EDIT ARTICLE DIALOG ────────────────────────────── */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Edit Article</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Title */}
            <div>
              <label className={labelCls}>Title *</label>
              <Input
                value={editTitle}
                onChange={e => handleEditTitleChange(e.target.value)}
                className="font-serif text-base"
              />
            </div>

            {/* Slug */}
            <div>
              <label className={labelCls}>Slug *</label>
              <Input
                value={editSlug}
                onChange={e => setEditSlug(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            {/* Category + Author */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Category *</label>
                <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={labelCls}>Author *</label>
                <Select value={editAuthorId} onValueChange={setEditAuthorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select author" />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map(auth => (
                      <SelectItem key={auth.id} value={auth.id}>
                        {auth.name}{' '}
                        <span className="text-muted-foreground">({auth.role})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className={labelCls}>Excerpt</label>
              <Textarea
                value={editExcerpt}
                onChange={e => setEditExcerpt(e.target.value)}
                rows={2}
              />
            </div>

            {/* Content with preview */}
            <div>
              <label className={labelCls}>Content</label>
              <Tabs value={editMdTab} onValueChange={setEditMdTab} className="rounded-lg border">
                <TabsList className="w-full rounded-none border-b bg-transparent px-0">
                  <TabsTrigger value="write" className="flex-1 gap-1.5 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                    <Pencil className="h-3 w-3" />
                    Write
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex-1 gap-1.5 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                    <Eye className="h-3 w-3" />
                    Preview
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {wordCount(editContent)} words
                    </span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="write" className="mt-0">
                  <Textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={10}
                    className="rounded-none border-0 font-mono text-sm resize-y focus-visible:ring-0"
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-0">
                  <ScrollArea className="max-h-[280px]">
                    <div className="prose prose-sm dark:prose-invert max-w-none p-4">
                      {editContent ? (
                        <ReactMarkdown>{editContent}</ReactMarkdown>
                      ) : (
                        <p className="text-muted-foreground italic">Nothing to preview…</p>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>

            {/* Cover Image */}
            <div>
              <label className={labelCls}>Cover Image URL</label>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <Input
                    value={editCoverImage}
                    onChange={e => setEditCoverImage(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                {editCoverImage && (
                  <div className="h-12 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                    <img
                      src={editCoverImage}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Tags + Read Time */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Tags</label>
                <Input
                  value={editTags}
                  onChange={e => setEditTags(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className={labelCls}>Read Time (min)</label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={editReadTime}
                  onChange={e => setEditReadTime(e.target.value)}
                  className="font-mono text-sm w-24"
                />
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button onClick={handleEditSave} disabled={editSaving} className="gap-2">
                {editSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
                {editSaving ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button variant="ghost" onClick={() => setEditDialog(false)} className="text-xs">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}