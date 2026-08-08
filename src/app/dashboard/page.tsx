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
  BookOpen, Shield, Flag, XCircle, CheckCircle, Trash2,
  MessageSquare, TrendingUp, ChevronRight, Menu, X,
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

interface FlaggedComment {
  id: string; author: string; content: string; status: string
  reportCount: number; createdAt: string; articleId: string
  article: { id: string; title: string; slug: string }
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

const timeAgo = (iso: string) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const labelCls = 'font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5'
const thCls = 'text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground'
const tdCls = 'px-4 py-3'

const navItems = [
  { id: 'articles', label: 'My Articles', icon: FileText },
  { id: 'new', label: 'New Article', icon: Plus },
  { id: 'calendar', label: 'Content Calendar', icon: Calendar },
  { id: 'comments', label: 'Comment Queue', icon: Shield },
] as const

// ── Component ───────────────────────────────────────────────

export default function EditorDashboard() {
  const [activeTab, setActiveTab] = useState<string>('articles')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [authors, setAuthors] = useState<AuthorItem[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  // Flagged comments for editor quick-moderate
  const [flaggedComments, setFlaggedComments] = useState<FlaggedComment[]>([])
  const [commentFilter, setCommentFilter] = useState<string>('flagged')
  const [allComments, setAllComments] = useState<FlaggedComment[]>([])

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
      const results = await Promise.allSettled([
        fetch('/api/admin/articles').then(r => r.ok ? r.json() : []),
        fetch('/api/categories').then(r => r.ok ? r.json() : []),
        fetch('/api/authors').then(r => r.ok ? r.json() : []),
        fetch('/api/events').then(r => r.ok ? r.json() : []),
        fetch('/api/admin/comments?status=flagged&limit=20').then(r => r.ok ? r.json() : { comments: [] }),
      ])
      if (results[0].status === 'fulfilled') setArticles(results[0].value)
      if (results[1].status === 'fulfilled') setCategories(results[1].value)
      if (results[2].status === 'fulfilled') setAuthors(results[2].value)
      if (results[3].status === 'fulfilled') setEvents(results[3].value)
      if (results[4].status === 'fulfilled') setFlaggedComments(results[4].value.comments || [])
    } catch (err) {
      console.error('Failed to fetch data', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchComments = useCallback(async (status?: string) => {
    try {
      const params = new URLSearchParams()
      if (status && status !== 'all') params.set('status', status)
      params.set('limit', '30')
      const res = await fetch(`/api/admin/comments?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAllComments(data.comments || [])
      }
    } catch (err) {
      console.error('Failed to fetch comments', err)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => { if (activeTab === 'comments') fetchComments(commentFilter) }, [activeTab, commentFilter, fetchComments])

  // ── Comment moderation ─────────────────────────────────────
  const moderateComment = async (id: string, status: string) => {
    await fetch(`/api/admin/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchComments(commentFilter)
    fetchAll() // refresh flagged count
  }

  const deleteComment = async (id: string) => {
    if (!confirm('Permanently delete this comment?')) return
    await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
    fetchComments(commentFilter)
    fetchAll()
  }

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
          title: formTitle, slug: formSlug, excerpt: formExcerpt, content: formContent,
          coverImage: formCoverImage, categoryId: formCategoryId, authorId: formAuthorId,
          tags: formTags, readTime: parseInt(formReadTime) || 5,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create article')
      }
      setFormTitle(''); setFormSlug(''); setFormExcerpt(''); setFormContent('')
      setFormCoverImage(''); setFormCategoryId(''); setFormAuthorId('')
      setFormTags(''); setFormReadTime('5')
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
          title: editTitle, slug: editSlug, excerpt: editExcerpt, content: editContent,
          coverImage: editCoverImage, categoryId: editCategoryId, authorId: editAuthorId,
          tags: editTags, readTime: parseInt(editReadTime) || 5,
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

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length

  const navigate = (tab: string) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Sidebar ─── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-serif font-bold text-lg">Sanaa</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-secondary">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map(item => {
              const isActive = activeTab === item.id
              const showBadge = item.id === 'comments' && flaggedComments.length > 0
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }
                  `}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {showBadge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full">
                      {flaggedComments.length}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="border-t border-border p-3 space-y-1 shrink-0">
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Shield className="h-4 w-4" />
              <span>Admin Dashboard</span>
              <ChevronRight className="h-3 w-3 ml-auto" />
            </Link>
            <button
              onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/login' }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 bg-background/95 backdrop-blur border-b border-border flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-md hover:bg-secondary">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-serif font-bold text-base">
                {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono">Editor Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {flaggedComments.length > 0 && activeTab !== 'comments' && (
              <button
                onClick={() => navigate('comments')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors"
              >
                <Flag className="h-3.5 w-3.5" />
                {flaggedComments.length} flagged
              </button>
            )}
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <ExternalLink className="h-3 w-3" />
                <span className="hidden sm:inline">View Site</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Success Banner */}
        {successMsg && (
          <div className="border-b bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              {successMsg}
            </div>
          </div>
        )}

        {/* Content */}
        <main className="p-4 md:p-6 lg:p-8 max-w-6xl">
          {/* ─── MY ARTICLES TAB ──────────────────────────────── */}
          {activeTab === 'articles' && (
            <div className="animate-fadeIn">
              {/* Stats row */}
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="p-4 rounded-xl border border-border bg-card">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Total Articles</p>
                  <p className="mt-1 text-2xl font-bold font-serif">{articles.length}</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Total Views</p>
                  <p className="mt-1 text-2xl font-bold font-serif">{totalViews.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Categories</p>
                  <p className="mt-1 text-2xl font-bold font-serif">{new Set(articles.map(a => a.category?.name)).size}</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Avg Views</p>
                  <p className="mt-1 text-2xl font-bold font-serif">
                    {articles.length ? Math.round(totalViews / articles.length).toLocaleString() : '0'}
                  </p>
                </div>
              </div>

              {/* Flagged alert */}
              {flaggedComments.length > 0 && (
                <button
                  onClick={() => navigate('comments')}
                  className="w-full mb-6 flex items-center gap-3 p-3 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors text-left group"
                >
                  <Flag className="h-4 w-4 text-destructive shrink-0" />
                  <span className="text-sm font-medium">{flaggedComments.length} comment{flaggedComments.length !== 1 ? 's' : ''} need review</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-destructive ml-auto" />
                </button>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading articles…
                </div>
              ) : articles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No articles yet. Create your first article!</p>
                  <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => navigate('new')}>
                    <Plus className="h-3.5 w-3.5" /> New Article
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-secondary/50">
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
                        <tr key={article.id} className="border-b last:border-0 transition-colors hover:bg-secondary/30">
                          <td className={tdCls}>
                            <div className="flex items-center gap-2">
                              {article.isPinned && (
                                <span className="shrink-0 text-primary text-[10px] font-mono font-bold">PIN</span>
                              )}
                              {article.isFeatured && (
                                <Badge variant="secondary" className="shrink-0 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[9px] px-1.5">Featured</Badge>
                              )}
                              <span className="max-w-[200px] truncate font-medium lg:max-w-[300px]">{article.title}</span>
                            </div>
                          </td>
                          <td className={`${tdCls} hidden sm:table-cell`}>
                            {article.category && (
                              <Badge variant="outline" className="text-[10px]" style={{ borderColor: article.category.color, color: article.category.color }}>
                                {article.category.name}
                              </Badge>
                            )}
                          </td>
                          <td className={`${tdCls} hidden md:table-cell`}>
                            <span className="font-mono text-xs text-muted-foreground">{fmtDate(article.publishedAt)}</span>
                          </td>
                          <td className={`${tdCls} hidden md:table-cell`}>
                            <span className="flex items-center gap-1 font-mono text-xs">
                              <Eye className="h-3 w-3 text-muted-foreground" />{article.views.toLocaleString()}
                            </span>
                          </td>
                          <td className={tdCls}>
                            <div className="flex items-center gap-1">
                              <Link href={`/articles/${article.slug}`} target="_blank">
                                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs"><ExternalLink className="h-3 w-3" /><span className="hidden sm:inline">View</span></Button>
                              </Link>
                              <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => openEdit(article)}>
                                <Pencil className="h-3 w-3" /><span className="hidden sm:inline">Edit</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ─── NEW ARTICLE TAB ──────────────────────────────── */}
          {activeTab === 'new' && (
            <div className="animate-fadeIn mx-auto max-w-3xl">
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-bold">Create New Article</h2>
                <p className="text-sm text-muted-foreground mt-1">Write and publish a new story</p>
              </div>

              {formError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className={labelCls}>Title *</label>
                  <Input value={formTitle} onChange={e => handleTitleChange(e.target.value)} placeholder="Enter article title…" className="font-serif text-base" />
                </div>
                <div>
                  <label className={labelCls}>Slug *</label>
                  <Input value={formSlug} onChange={e => setFormSlug(e.target.value)} placeholder="article-url-slug" className="font-mono text-sm" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Category *</label>
                    <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />{cat.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className={labelCls}>Author *</label>
                    <Select value={formAuthorId} onValueChange={setFormAuthorId}>
                      <SelectTrigger><SelectValue placeholder="Select author" /></SelectTrigger>
                      <SelectContent>
                        {authors.map(auth => (
                          <SelectItem key={auth.id} value={auth.id}>{auth.name} <span className="text-muted-foreground">({auth.role})</span></SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Excerpt</label>
                  <Textarea value={formExcerpt} onChange={e => setFormExcerpt(e.target.value)} placeholder="A brief summary of the article…" rows={3} />
                </div>
                <div>
                  <label className={labelCls}>Content</label>
                  <Tabs value={mdTab} onValueChange={setMdTab} className="rounded-lg border">
                    <TabsList className="w-full rounded-none border-b bg-transparent px-0">
                      <TabsTrigger value="write" className="flex-1 gap-1.5 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"><Pencil className="h-3 w-3" />Write</TabsTrigger>
                      <TabsTrigger value="preview" className="flex-1 gap-1.5 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"><Eye className="h-3 w-3" />Preview <span className="font-mono text-[9px] text-muted-foreground">{wordCount(formContent)} words</span></TabsTrigger>
                    </TabsList>
                    <TabsContent value="write" className="mt-0">
                      <Textarea value={formContent} onChange={e => setFormContent(e.target.value)} placeholder="Write your article content in Markdown…" rows={16} className="rounded-none border-0 font-mono text-sm resize-y focus-visible:ring-0" />
                    </TabsContent>
                    <TabsContent value="preview" className="mt-0">
                      <ScrollArea className="max-h-[420px]">
                        <div className="prose prose-sm dark:prose-invert max-w-none p-4">
                          {formContent ? <ReactMarkdown>{formContent}</ReactMarkdown> : <p className="text-muted-foreground italic">Nothing to preview yet…</p>}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>
                <div>
                  <label className={labelCls}>Cover Image URL</label>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <Input value={formCoverImage} onChange={e => setFormCoverImage(e.target.value)} placeholder="https://example.com/image.jpg" className="font-mono text-xs" />
                    </div>
                    {formCoverImage && (
                      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md border bg-muted">
                        <img src={formCoverImage} alt="Cover preview" className="h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Tags</label>
                    <Input value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="art, nairobi, exhibition (comma-separated)" className="text-sm" />
                  </div>
                  <div>
                    <label className={labelCls}>Read Time (minutes)</label>
                    <Input type="number" min={1} max={60} value={formReadTime} onChange={e => setFormReadTime(e.target.value)} className="font-mono text-sm w-24" />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Button onClick={handleCreate} disabled={formSaving} className="gap-2">
                    {formSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {formSaving ? 'Publishing…' : 'Publish Article'}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('articles')} className="text-xs">Cancel</Button>
                </div>
              </div>
            </div>
          )}

          {/* ─── CONTENT CALENDAR TAB ─────────────────────────── */}
          {activeTab === 'calendar' && (
            <div className="animate-fadeIn mx-auto max-w-3xl">
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-bold">Content Calendar</h2>
                <p className="text-sm text-muted-foreground mt-1">Upcoming events for story inspiration</p>
              </div>

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
                      <div key={event.id} className="group rounded-xl border border-border p-4 transition-colors hover:shadow-sm hover:bg-secondary/30">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{fmtEventDate(event.date, event.endDate)}</span>
                              {catName && <Badge variant="outline" className="text-[9px] px-1.5" style={{ borderColor: catColor, color: catColor }}>{catName}</Badge>}
                              {event.isFeatured && <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[9px] px-1.5">Featured</Badge>}
                            </div>
                            <h3 className="font-serif text-base font-semibold">{event.title}</h3>
                            {event.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>}
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              {(event.venue || event.city) && (
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{[event.venue, event.city].filter(Boolean).join(', ')}</span>
                              )}
                            </div>
                          </div>
                          <div className="hidden shrink-0 sm:block">
                            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-muted text-center">
                              <span className="text-lg font-bold leading-none">{new Date(event.date).getDate()}</span>
                              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{new Date(event.date).toLocaleDateString('en-KE', { month: 'short' })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── COMMENT QUEUE TAB ────────────────────────────── */}
          {activeTab === 'comments' && (
            <div className="animate-fadeIn space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold">Comment Queue</h2>
                  <p className="text-sm text-muted-foreground mt-1">Review and moderate reader comments</p>
                </div>
                <div className="flex items-center gap-2">
                  {['flagged', 'published', 'all'].map(f => (
                    <button
                      key={f}
                      onClick={() => setCommentFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        commentFilter === f
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {allComments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  {commentFilter === 'flagged' ? (
                    <>
                      <CheckCircle className="h-10 w-10 text-green-500/40 mb-3" />
                      <p className="text-sm text-muted-foreground">No flagged comments. All clear!</p>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground">No comments found.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {allComments.map(c => {
                    const isFlagged = c.status === 'flagged'
                    const isRemoved = c.status === 'removed'
                    return (
                      <div
                        key={c.id}
                        className={`p-4 rounded-xl border transition-all hover:shadow-sm ${
                          isFlagged ? 'border-destructive/30 bg-destructive/5' : isRemoved ? 'border-border bg-muted/50 opacity-70' : 'border-border bg-card'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                            isFlagged ? 'bg-destructive/20 text-destructive' : 'bg-primary/10 text-primary'
                          }`}>
                            {c.author.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              <span className="font-semibold text-sm">{c.author}</span>
                              {isFlagged && <Badge variant="destructive" className="text-[10px] gap-1"><Flag className="h-2.5 w-2.5" />{c.reportCount}</Badge>}
                              {isRemoved && <Badge variant="secondary" className="text-[10px]">Removed</Badge>}
                              <span className="text-[10px] font-mono text-muted-foreground ml-auto">{timeAgo(c.createdAt)}</span>
                            </div>
                            <p className="text-sm text-foreground/80 mb-1.5">{c.content}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-mono">on:</span>
                              <a href={`/articles/${c.article.slug}`} target="_blank" className="text-primary hover:underline font-medium">{c.article.title}</a>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {isFlagged && (
                              <button onClick={() => moderateComment(c.id, 'published')} className="p-2 rounded-lg hover:bg-green-500/10 text-muted-foreground hover:text-green-600 transition-colors" title="Restore">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            {c.status !== 'removed' && (
                              <button onClick={() => moderateComment(c.id, 'removed')} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Remove">
                                <XCircle className="h-4 w-4" />
                              </button>
                            )}
                            {c.status !== 'flagged' && (
                              <button onClick={() => moderateComment(c.id, 'flagged')} className="p-2 rounded-lg hover:bg-yellow-500/10 text-muted-foreground hover:text-yellow-600 transition-colors" title="Flag">
                                <Flag className="h-4 w-4" />
                              </button>
                            )}
                            <button onClick={() => deleteComment(c.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ─── EDIT ARTICLE DIALOG ────────────────────────────── */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Edit Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className={labelCls}>Title *</label>
              <Input value={editTitle} onChange={e => handleEditTitleChange(e.target.value)} className="font-serif text-base" />
            </div>
            <div>
              <label className={labelCls}>Slug *</label>
              <Input value={editSlug} onChange={e => setEditSlug(e.target.value)} className="font-mono text-sm" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Category *</label>
                <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />{cat.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={labelCls}>Author *</label>
                <Select value={editAuthorId} onValueChange={setEditAuthorId}>
                  <SelectTrigger><SelectValue placeholder="Select author" /></SelectTrigger>
                  <SelectContent>
                    {authors.map(auth => (
                      <SelectItem key={auth.id} value={auth.id}>{auth.name} <span className="text-muted-foreground">({auth.role})</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Excerpt</label>
              <Textarea value={editExcerpt} onChange={e => setEditExcerpt(e.target.value)} rows={2} />
            </div>
            <div>
              <label className={labelCls}>Content</label>
              <Tabs value={editMdTab} onValueChange={setEditMdTab} className="rounded-lg border">
                <TabsList className="w-full rounded-none border-b bg-transparent px-0">
                  <TabsTrigger value="write" className="flex-1 gap-1.5 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"><Pencil className="h-3 w-3" />Write</TabsTrigger>
                  <TabsTrigger value="preview" className="flex-1 gap-1.5 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"><Eye className="h-3 w-3" />Preview <span className="font-mono text-[9px] text-muted-foreground">{wordCount(editContent)} words</span></TabsTrigger>
                </TabsList>
                <TabsContent value="write" className="mt-0">
                  <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={10} className="rounded-none border-0 font-mono text-sm resize-y focus-visible:ring-0" />
                </TabsContent>
                <TabsContent value="preview" className="mt-0">
                  <ScrollArea className="max-h-[280px]">
                    <div className="prose prose-sm dark:prose-invert max-w-none p-4">
                      {editContent ? <ReactMarkdown>{editContent}</ReactMarkdown> : <p className="text-muted-foreground italic">Nothing to preview…</p>}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
            <div>
              <label className={labelCls}>Cover Image URL</label>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <Input value={editCoverImage} onChange={e => setEditCoverImage(e.target.value)} className="font-mono text-xs" />
                </div>
                {editCoverImage && (
                  <div className="h-12 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                    <img src={editCoverImage} alt="Cover preview" className="h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Tags</label>
                <Input value={editTags} onChange={e => setEditTags(e.target.value)} className="text-sm" />
              </div>
              <div>
                <label className={labelCls}>Read Time (min)</label>
                <Input type="number" min={1} max={60} value={editReadTime} onChange={e => setEditReadTime(e.target.value)} className="font-mono text-sm w-24" />
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Button onClick={handleEditSave} disabled={editSaving} className="gap-2">
                {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                {editSaving ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button variant="ghost" onClick={() => setEditDialog(false)} className="text-xs">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
