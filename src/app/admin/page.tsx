'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText, Users, Tag, Calendar, Eye, MessageSquare, Star, Pin, Trash2,
  Plus, BarChart3, ArrowLeft, BookmarkCheck, BookOpen, Mail,
  TrendingUp, Pencil, ExternalLink, Palette, Flag, CheckCircle, XCircle,
  Upload, Loader2, Search, Shield, AlertTriangle, ChevronRight, Filter,
  LayoutDashboard, MessagesSquare, UserCog, FolderOpen, Megaphone, Paintbrush, UsersRound,
  Menu, X, ChevronDown, ImageIcon, Copy, Check, RotateCcw,
} from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'
import { ArticleForm, type ArticleFormData } from '@/components/article-form'
import { type CDNFile, CDN_FOLDERS, type CDNFolder } from '@/lib/cdn'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

// ── Interfaces ──────────────────────────────────────────────

interface Article {
  id: string; title: string; slug: string; excerpt: string; content?: string
  publishedAt: string; views: number; isFeatured: boolean; isPinned: boolean
  category: { name: string; color: string }; author: { name: string; id: string }
  commentCount: number; coverImage?: string; tags?: string; readTime?: number
}

interface EventItem {
  id: string; title: string; description: string; date: string
  endDate: string | null; venue: string; city: string; category: string
  imageUrl: string; ticketUrl: string; isFeatured: boolean; isPast: boolean
  createdAt: string
}

interface MakerItem {
  id: string; name: string; slug: string; discipline: string; bio: string
  avatar: string; location: string; website: string; instagram: string
  twitter: string; isFeatured: boolean; createdAt: string
}

interface AuthorItem {
  id: string; name: string; slug: string; bio: string; avatar: string
  role: string; createdAt: string; _count?: { articles: number }
}

interface CategoryItem {
  id: string; name: string; slug: string; description: string; color: string
  createdAt: string; _count?: { articles: number; events: number }
}

interface SubscriberItem {
  id: string; name: string; email: string; createdAt: string
}

interface CommentItem {
  id: string; author: string; content: string; status: string
  reportCount: number; createdAt: string; articleId: string
  article: { id: string; title: string; slug: string }
}

interface Stats {
  articles: number; authors: number; categories: number; events: number
  comments: number; makers: number; subscribers: number; totalViews: number
  flaggedComments: number
  commentBreakdown: { published: number; flagged: number; removed: number }
  recentFlagged: CommentItem[]
}

interface CommentStats {
  published: number; flagged: number; removed: number; total: number
}

// ── Helpers ─────────────────────────────────────────────────

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')

const toDatetimeLocal = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
const fmtDateTime = (iso: string) => new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const timeAgo = (iso: string) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const labelCls = 'font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1'
const thCls = 'text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground'
const tdCls = 'px-4 py-3'
const actionBtnCls = 'p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground'

const PIE_COLORS = ['#22c55e', '#ef4444', '#6b7280']

// ── Sidebar Nav Items ───────────────────────────────────────

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'moderation', label: 'Moderation', icon: Shield },
  { id: 'articles', label: 'Articles', icon: FileText },
  { id: 'new-article', label: 'New Article', icon: Plus },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'makers', label: 'Makers', icon: Paintbrush },
  { id: 'authors', label: 'Authors', icon: UserCog },
  { id: 'categories', label: 'Categories', icon: FolderOpen },
  { id: 'media', label: 'Media', icon: ImageIcon },
  { id: 'subscribers', label: 'Subscribers', icon: Megaphone },
] as const

// ── Component ───────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [makers, setMakers] = useState<MakerItem[]>([])
  const [authors, setAuthors] = useState<AuthorItem[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([])

  // Comments state for moderation tab
  const [modComments, setMmodComments] = useState<CommentItem[]>([])
  const [modStats, setMmodStats] = useState<CommentStats | null>(null)
  const [modStatus, setModStatus] = useState<string>('flagged')
  const [modSearch, setMmodSearch] = useState('')
  const [modPage, setMmodPage] = useState(1)
  const [modTotalPages, setMmodTotalPages] = useState(1)
  const [modLoading, setMmodLoading] = useState(false)

  // Media library state
  const [mediaFiles, setMediaFiles] = useState<CDNFile[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [mediaFolder, setMediaFolder] = useState<CDNFolder | ''>('')
  const [mediaSearch, setMediaSearch] = useState('')
  const [mediaPage, setMediaPage] = useState(1)
  const [mediaTotalPages, setMediaTotalPages] = useState(1)
  const [mediaTotal, setMediaTotal] = useState(0)
  const [mediaDeleting, setMediaDeleting] = useState<string | null>(null)
  const [mediaUploading, setMediaUploading] = useState(false)
  const [mediaUploadFolder, setMediaUploadFolder] = useState<CDNFolder>('misc')
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [mediaPreview, setMediaPreview] = useState<CDNFile | null>(null)

  // Article form
  const [artDialog, setArtDialog] = useState(false)
  const [artEdit, setArtEdit] = useState<Article | null>(null)
  const [formDataLoading, setFormDataLoading] = useState(false)
  const [formDataError, setFormDataError] = useState<string | null>(null)
  const [artTitle, setArtTitle] = useState('')
  const [artSlug, setArtSlug] = useState('')
  const [artExcerpt, setArtExcerpt] = useState('')
  const [artContent, setArtContent] = useState('')
  const [artCoverImage, setArtCoverImage] = useState('')
  const [artCategory, setArtCategory] = useState('')
  const [artAuthor, setArtAuthor] = useState('')
  const [artTags, setArtTags] = useState('')
  const [artReadTime, setArtReadTime] = useState('5')
  const [artSaving, setArtSaving] = useState(false)
  const [parsing, setParsing] = useState(false)

  // Event form
  const [evtDialog, setEvtDialog] = useState(false)
  const [evtEdit, setEvtEdit] = useState<EventItem | null>(null)
  const [evtTitle, setEvtTitle] = useState('')
  const [evtDesc, setEvtDesc] = useState('')
  const [evtDate, setEvtDate] = useState('')
  const [evtEndDate, setEvtEndDate] = useState('')
  const [evtVenue, setEvtVenue] = useState('')
  const [evtCity, setEvtCity] = useState('')
  const [evtCategory, setEvtCategory] = useState('')
  const [evtImageUrl, setEvtImageUrl] = useState('')
  const [evtTicketUrl, setEvtTicketUrl] = useState('')
  const [evtFeatured, setEvtFeatured] = useState(false)
  const [evtPast, setEvtPast] = useState(false)
  const [evtSaving, setEvtSaving] = useState(false)

  // Maker form
  const [mkrDialog, setMkrDialog] = useState(false)
  const [mkrEdit, setMkrEdit] = useState<MakerItem | null>(null)
  const [mkrName, setMkrName] = useState('')
  const [mkrSlug, setMkrSlug] = useState('')
  const [mkrDiscipline, setMkrDiscipline] = useState('')
  const [mkrBio, setMkrBio] = useState('')
  const [mkrLocation, setMkrLocation] = useState('')
  const [mkrWebsite, setMkrWebsite] = useState('')
  const [mkrInstagram, setMkrInstagram] = useState('')
  const [mkrTwitter, setMkrTwitter] = useState('')
  const [mkrFeatured, setMkrFeatured] = useState(false)
  const [mkrSaving, setMkrSaving] = useState(false)

  // Author form
  const [autDialog, setAutDialog] = useState(false)
  const [autEdit, setAutEdit] = useState<AuthorItem | null>(null)
  const [autName, setAutName] = useState('')
  const [autSlug, setAutSlug] = useState('')
  const [autBio, setAutBio] = useState('')
  const [autAvatar, setAutAvatar] = useState('')
  const [autRole, setAutRole] = useState('Writer')
  const [autSaving, setAutSaving] = useState(false)

  // Category form
  const [catDialog, setCatDialog] = useState(false)
  const [catEdit, setCatEdit] = useState<CategoryItem | null>(null)
  const [catName, setCatName] = useState('')
  const [catSlug, setCatSlug] = useState('')
  const [catDescription, setCatDescription] = useState('')
  const [catColor, setCatColor] = useState('#8B2252')
  const [catSaving, setCatSaving] = useState(false)

  // ── Fetch all data ─────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const endpoints = [
        ['stats', '/api/admin/stats', setStats],
        ['articles', '/api/admin/articles', setArticles],
        ['events', '/api/admin/events', setEvents],
        ['makers', '/api/admin/makers', setMakers],
        ['authors', '/api/admin/authors', setAuthors],
        ['categories', '/api/admin/categories', setCategories],
        ['subscribers', '/api/admin/subscribers', setSubscribers],
      ] as const
      const results = await Promise.allSettled(
        endpoints.map(async ([key, url, setter]) => {
          const res = await fetch(url)
          if (!res.ok) throw new Error(`${key} returned ${res.status}`)
          const data = await res.json()
          setter(data)
        })
      )
      // Check if stats specifically failed
      const statsResult = results[0]
      if (statsResult.status === 'rejected') {
        setFetchError(statsResult.reason?.message || 'Failed to load stats')
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Independent fetch for categories/authors (new article tab) ──
  const fetchFormDependencies = useCallback(async () => {
    if (categories.length > 0 && authors.length > 0) return // already loaded
    setFormDataLoading(true)
    setFormDataError(null)
    try {
      const results = await Promise.allSettled([
        categories.length === 0 ? fetch('/api/admin/categories').then(r => { if (!r.ok) throw new Error(`categories ${r.status}`); return r.json() }) : Promise.resolve(categories),
        authors.length === 0 ? fetch('/api/admin/authors').then(r => { if (!r.ok) throw new Error(`authors ${r.status}`); return r.json() }) : Promise.resolve(authors),
      ])
      if (results[0].status === 'fulfilled' && Array.isArray(results[0].value)) setCategories(results[0].value)
      if (results[1].status === 'fulfilled' && Array.isArray(results[1].value)) setAuthors(results[1].value)
      const failed = results.filter(r => r.status === 'rejected').map(r => (r as PromiseRejectedResult).reason?.message)
      if (failed.length === 2) setFormDataError('Could not load categories or authors')
      else if (failed.length === 1) setFormDataError(`Could not load ${failed[0]}`)
    } catch (err: any) {
      setFormDataError(err.message || 'Failed to load form data')
    } finally {
      setFormDataLoading(false)
    }
  }, [categories.length, authors.length])

  useEffect(() => {
    if (activeTab === 'new-article') fetchFormDependencies()
  }, [activeTab, fetchFormDependencies])

  // ── Fetch comments for moderation ──────────────────────────
  const fetchMmodComments = useCallback(async () => {
    setMmodLoading(true)
    try {
      const params = new URLSearchParams()
      if (modStatus) params.set('status', modStatus)
      if (modSearch) params.set('search', modSearch)
      params.set('page', String(modPage))
      const res = await fetch(`/api/admin/comments?${params}`)
      const data = await res.json()
      setMmodComments(data.comments || [])
      setMmodStats(data.stats || null)
      setMmodTotalPages(data.pagination?.pages || 1)
    } catch (err) {
      console.error('Failed to fetch comments', err)
    } finally {
      setMmodLoading(false)
    }
  }, [modStatus, modSearch, modPage])

  useEffect(() => { fetchMmodComments() }, [fetchMmodComments])

  // ── Comment moderation actions ─────────────────────────────
  const moderateComment = async (id: string, status: string) => {
    await fetch(`/api/admin/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchMmodComments()
    fetchAll() // refresh stats
  }

  const deleteComment = async (id: string) => {
    if (!confirm('Permanently delete this comment? This cannot be undone.')) return
    await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
    fetchMmodComments()
    fetchAll()
  }

  const bulkAction = async (action: 'published' | 'removed') => {
    const selected = modComments.map(c => c.id)
    if (!selected.length) return
    if (!confirm(`${action === 'published' ? 'Restore' : 'Remove'} ${selected.length} comments?`)) return
    await Promise.all(selected.map(id =>
      fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      })
    ))
    fetchMmodComments()
    fetchAll()
  }

  // ── Charts data ────────────────────────────────────────────
  const viewsChartData = useMemo(() => {
    if (!articles.length) return []
    return articles.slice(0, 8).map(a => ({
      name: a.title.length > 20 ? a.title.slice(0, 20) + '...' : a.title,
      views: a.views,
    }))
  }, [articles])

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {}
    articles.forEach(a => { map[a.category.name] = (map[a.category.name] || 0) + 1 })
    return Object.entries(map).map(([name, count]) => ({ name, count }))
  }, [articles])

  const commentPieData = useMemo(() => {
    if (!modStats) return []
    return [
      { name: 'Published', value: modStats.published },
      { name: 'Flagged', value: modStats.flagged },
      { name: 'Removed', value: modStats.removed },
    ].filter(d => d.value > 0)
  }, [modStats])

  // ── Article CRUD ───────────────────────────────────────────
  const openArtCreate = () => {
    setArtEdit(null)
    setArtTitle(''); setArtSlug(''); setArtExcerpt(''); setArtContent('')
    setArtCoverImage(''); setArtCategory(''); setArtAuthor('')
    setArtTags(''); setArtReadTime('5')
    setArtDialog(true)
  }
  const openArtEdit = (a: Article) => {
    setArtEdit(a)
    setArtTitle(a.title); setArtSlug(a.slug); setArtExcerpt(a.excerpt)
    setArtContent(''); setArtCoverImage(a.coverImage || '')
    setArtCategory(a.category?.name || ''); setArtAuthor(a.author?.name || '')
    setArtTags(''); setArtReadTime(String(5))
    setArtDialog(true)
  }
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setParsing(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/parse-file', { method: 'POST', body: form })
      if (!res.ok) { const data = await res.json(); alert(data.error || 'Failed to parse file'); return }
      const data = await res.json()
      if (data.titleHint && !artTitle) setArtTitle(data.titleHint)
      if (data.excerpt && !artExcerpt) setArtExcerpt(data.excerpt)
      if (data.readTime) setArtReadTime(String(data.readTime))
      if (data.tags && !artTags) setArtTags(data.tags)
      if (data.markdown) setArtContent(data.markdown)
    } catch { alert('Failed to parse file') } finally { setParsing(false); e.target.value = '' }
  }
  const saveArt = async () => {
    if (!artTitle || !artSlug) return
    setArtSaving(true)
    try {
      if (artEdit) {
        const res = await fetch(`/api/admin/articles/${artEdit.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: artTitle, slug: artSlug, excerpt: artExcerpt, coverImage: artCoverImage }) })
        if (res.ok) { const u = await res.json(); setArticles(p => p.map(a => a.id === u.id ? { ...a, ...u } : a)) }
      } else {
        const catId = categories.find(c => c.name === artCategory)?.id || ''
        const authId = authors.find(a => a.name === artAuthor)?.id || ''
        if (!catId || !authId) { setArtSaving(false); return }
        const res = await fetch('/api/admin/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: artTitle, slug: artSlug, excerpt: artExcerpt, content: artContent, coverImage: artCoverImage, categoryId: catId, authorId: authId, readTime: parseInt(artReadTime) || 5, tags: artTags }) })
        if (res.ok) { const n = await res.json(); setArticles(p => [n, ...p]); fetchAll() }
      }
      setArtDialog(false)
    } catch {}
    setArtSaving(false)
  }
  const toggleArtFeatured = async (a: Article) => {
    const res = await fetch(`/api/admin/articles/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isFeatured: !a.isFeatured }) })
    if (res.ok) setArticles(p => p.map(x => x.id === a.id ? { ...x, isFeatured: !x.isFeatured } : x))
  }
  const toggleArtPinned = async (a: Article) => {
    const res = await fetch(`/api/admin/articles/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPinned: !a.isPinned }) })
    if (res.ok) setArticles(p => p.map(x => x.id === a.id ? { ...x, isPinned: !x.isPinned } : x))
  }
  const deleteArt = async (id: string) => {
    if (!confirm('Delete this article? This cannot be undone.')) return
    const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
    if (res.ok) { setArticles(p => p.filter(a => a.id !== id)); fetchAll() }
  }

  // ── Event CRUD ─────────────────────────────────────────────
  const openEvtCreate = () => {
    setEvtEdit(null); setEvtTitle(''); setEvtDesc(''); setEvtDate(''); setEvtEndDate('')
    setEvtVenue(''); setEvtCity(''); setEvtCategory(''); setEvtImageUrl(''); setEvtTicketUrl('')
    setEvtFeatured(false); setEvtPast(false); setEvtDialog(true)
  }
  const openEvtEdit = (e: EventItem) => {
    setEvtEdit(e); setEvtTitle(e.title); setEvtDesc(e.description)
    setEvtDate(toDatetimeLocal(e.date)); setEvtEndDate(e.endDate ? toDatetimeLocal(e.endDate) : '')
    setEvtVenue(e.venue); setEvtCity(e.city); setEvtCategory(e.category)
    setEvtImageUrl(e.imageUrl); setEvtTicketUrl(e.ticketUrl)
    setEvtFeatured(e.isFeatured); setEvtPast(e.isPast); setEvtDialog(true)
  }
  const saveEvt = async () => {
    if (!evtTitle || !evtDate || !evtVenue || !evtCity) return
    setEvtSaving(true)
    try {
      const payload = { title: evtTitle, description: evtDesc, date: evtDate, endDate: evtEndDate || null, venue: evtVenue, city: evtCity, category: evtCategory, imageUrl: evtImageUrl, ticketUrl: evtTicketUrl, isFeatured: evtFeatured, isPast: evtPast }
      if (evtEdit) {
        const res = await fetch(`/api/admin/events/${evtEdit.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (res.ok) { const u = await res.json(); setEvents(p => p.map(e => e.id === u.id ? u : e)) }
      } else {
        const res = await fetch('/api/admin/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (res.ok) { const n = await res.json(); setEvents(p => [n, ...p]); fetchAll() }
      }
      setEvtDialog(false)
    } catch {}
    setEvtSaving(false)
  }
  const deleteEvt = async (id: string) => {
    if (!confirm('Delete this event? This cannot be undone.')) return
    const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
    if (res.ok) { setEvents(p => p.filter(e => e.id !== id)); fetchAll() }
  }

  // ── Maker CRUD ─────────────────────────────────────────────
  const openMkrCreate = () => {
    setMkrEdit(null); setMkrName(''); setMkrSlug(''); setMkrDiscipline(''); setMkrBio('')
    setMkrLocation(''); setMkrWebsite(''); setMkrInstagram(''); setMkrTwitter('')
    setMkrFeatured(false); setMkrDialog(true)
  }
  const openMkrEdit = (m: MakerItem) => {
    setMkrEdit(m); setMkrName(m.name); setMkrSlug(m.slug); setMkrDiscipline(m.discipline)
    setMkrBio(m.bio); setMkrLocation(m.location); setMkrWebsite(m.website)
    setMkrInstagram(m.instagram); setMkrTwitter(m.twitter); setMkrFeatured(m.isFeatured); setMkrDialog(true)
  }
  const saveMkr = async () => {
    if (!mkrName || !mkrSlug || !mkrDiscipline) return
    setMkrSaving(true)
    try {
      const payload = { name: mkrName, slug: mkrSlug, discipline: mkrDiscipline, bio: mkrBio, location: mkrLocation, website: mkrWebsite, instagram: mkrInstagram, twitter: mkrTwitter, isFeatured: mkrFeatured }
      if (mkrEdit) {
        const res = await fetch(`/api/admin/makers/${mkrEdit.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (res.ok) { const u = await res.json(); setMakers(p => p.map(m => m.id === u.id ? u : m)) }
      } else {
        const res = await fetch('/api/admin/makers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (res.ok) { const n = await res.json(); setMakers(p => [n, ...p]); fetchAll() }
      }
      setMkrDialog(false)
    } catch {}
    setMkrSaving(false)
  }
  const deleteMkr = async (id: string) => {
    if (!confirm('Delete this maker? This cannot be undone.')) return
    const res = await fetch(`/api/admin/makers/${id}`, { method: 'DELETE' })
    if (res.ok) { setMakers(p => p.filter(m => m.id !== id)); fetchAll() }
  }

  // ── Author CRUD ────────────────────────────────────────────
  const openAutCreate = () => {
    setAutEdit(null); setAutName(''); setAutSlug(''); setAutBio(''); setAutAvatar(''); setAutRole('Writer'); setAutDialog(true)
  }
  const openAutEdit = (a: AuthorItem) => {
    setAutEdit(a); setAutName(a.name); setAutSlug(a.slug); setAutBio(a.bio); setAutAvatar(a.avatar); setAutRole(a.role); setAutDialog(true)
  }
  const saveAut = async () => {
    if (!autName || !autSlug) return
    setAutSaving(true)
    try {
      const payload = { name: autName, slug: autSlug, bio: autBio, avatar: autAvatar, role: autRole }
      if (autEdit) {
        const res = await fetch(`/api/admin/authors/${autEdit.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (res.ok) { const u = await res.json(); setAuthors(p => p.map(a => a.id === u.id ? u : a)) }
      } else {
        const res = await fetch('/api/admin/authors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (res.ok) { const n = await res.json(); setAuthors(p => [n, ...p]); fetchAll() }
      }
      setAutDialog(false)
    } catch {}
    setAutSaving(false)
  }
  const deleteAut = async (id: string) => {
    if (!confirm('Delete this author? This will also delete all their articles. This cannot be undone.')) return
    const res = await fetch(`/api/admin/authors/${id}`, { method: 'DELETE' })
    if (res.ok) { setAuthors(p => p.filter(a => a.id !== id)); fetchAll() }
  }

  // ── Category CRUD ──────────────────────────────────────────
  const openCatCreate = () => {
    setCatEdit(null); setCatName(''); setCatSlug(''); setCatDescription(''); setCatColor('#8B2252'); setCatDialog(true)
  }
  const openCatEdit = (c: CategoryItem) => {
    setCatEdit(c); setCatName(c.name); setCatSlug(c.slug); setCatDescription(c.description); setCatColor(c.color); setCatDialog(true)
  }
  const saveCat = async () => {
    if (!catName || !catSlug) return
    setCatSaving(true)
    try {
      const payload = { name: catName, slug: catSlug, description: catDescription, color: catColor }
      if (catEdit) {
        const res = await fetch(`/api/admin/categories/${catEdit.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (res.ok) { const u = await res.json(); setCategories(p => p.map(c => c.id === u.id ? u : c)) }
      } else {
        const res = await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (res.ok) { const n = await res.json(); setCategories(p => [...p, n]); fetchAll() }
      }
      setCatDialog(false)
    } catch {}
    setCatSaving(false)
  }
  const deleteCat = async (id: string) => {
    if (!confirm('Delete this category? This will affect associated articles and events. This cannot be undone.')) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    if (res.ok) { setCategories(p => p.filter(c => c.id !== id)); fetchAll() }
  }

  // ── Subscriber delete ──────────────────────────────────────
  const deleteSub = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return
    const res = await fetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' })
    if (res.ok) { setSubscribers(p => p.filter(s => s.id !== id)); fetchAll() }
  }

  // ── Media Library helpers ─────────────────────────────────
  const fetchMedia = useCallback(async () => {
    setMediaLoading(true)
    try {
      const params = new URLSearchParams({ page: String(mediaPage), limit: '40' })
      if (mediaFolder) params.set('folder', mediaFolder)
      const res = await fetch(`/api/cdn/list?${params}`)
      const json = await res.json()
      if (json.success) {
        let files = json.data.files || []
        if (mediaSearch) {
          const q = mediaSearch.toLowerCase()
          files = files.filter((f: CDNFile) => f.filename.toLowerCase().includes(q) || f.path.toLowerCase().includes(q))
        }
        setMediaFiles(files)
        setMediaTotal(json.data.total || 0)
        setMediaTotalPages(json.data.totalPages || 1)
      }
    } catch { /* silent */ }
    setMediaLoading(false)
  }, [mediaPage, mediaFolder, mediaSearch])

  useEffect(() => { if (activeTab === 'media') fetchMedia() }, [activeTab, fetchMedia])

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['image/jpeg','image/png','image/gif','image/webp','image/svg+xml','image/avif']
    if (!allowed.includes(file.type)) return
    if (file.size > 10 * 1024 * 1024) return
    setMediaUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', mediaUploadFolder)
      const res = await fetch('/api/cdn/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (json.success) fetchMedia()
    } catch { /* silent */ }
    setMediaUploading(false)
    e.target.value = ''
  }

  const handleMediaDelete = async (file: CDNFile) => {
    if (!confirm(`Delete "${file.filename}"?`)) return
    setMediaDeleting(file.path)
    try {
      const res = await fetch('/api/cdn/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: file.path }) })
      const json = await res.json()
      if (json.success) fetchMedia()
    } catch { /* silent */ }
    setMediaDeleting(null)
  }

  const copyToClipboard = async (url: string) => {
    try { await navigator.clipboard.writeText(url); setCopiedUrl(url); setTimeout(() => setCopiedUrl(null), 2000) } catch { /* silent */ }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  // ── Navigate helper ────────────────────────────────────────
  const navigate = (tab: string) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Sidebar ─── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:z-auto lg:shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-serif font-bold text-lg">Sanaa</span>
              <Badge variant="outline" className="font-mono text-[9px] px-1.5 py-0">CMS</Badge>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-secondary">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map(item => {
              const isActive = activeTab === item.id
              const showBadge = item.id === 'moderation' && stats && stats.flaggedComments > 0
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
                      {stats.flaggedComments}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="border-t border-border p-3 space-y-1 shrink-0">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Pencil className="h-4 w-4" />
              <span>Editor Dashboard</span>
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
            <h1 className="font-serif font-bold text-lg">
              {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              View Site <ExternalLink className="h-3 w-3 inline ml-1" />
            </Link>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8 max-w-7xl">
          {/* ═══════════════════ OVERVIEW ═══════════════════ */}
          {activeTab === 'overview' && loading && !fetchError && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-3" />
              <span className="text-sm text-muted-foreground">Loading dashboard...</span>
            </div>
          )}
          {activeTab === 'overview' && fetchError && !stats && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <AlertTriangle className="h-10 w-10 text-amber-500/50 mb-3" />
              <p className="text-sm font-medium">Failed to load dashboard</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">{fetchError}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-2 max-w-xs">Ensure <code className="font-mono bg-muted px-1 py-0.5 rounded">DATABASE_URL</code> is set in your Vercel environment variables.</p>
              <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => fetchAll()}>
                <RotateCcw className="h-3.5 w-3.5" /> Retry
              </Button>
            </div>
          )}
          {activeTab === 'overview' && stats && (
            <div className="animate-fadeIn space-y-6">
              {/* Flagged alert banner */}
              {stats.flaggedComments > 0 && (
                <button
                  onClick={() => navigate('moderation')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors text-left group"
                >
                  <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">
                      {stats.flaggedComments} comment{stats.flaggedComments !== 1 ? 's' : ''} flagged for review
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stats.recentFlagged?.[0]?.content.slice(0, 80)}...
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors" />
                </button>
              )}

              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Articles', value: stats.articles, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
                  { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-forest', bg: 'bg-forest/10' },
                  { label: 'Comments', value: stats.comments, icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10', sub: stats.flaggedComments > 0 ? `${stats.flaggedComments} flagged` : undefined, subColor: 'text-destructive' },
                  { label: 'Subscribers', value: stats.subscribers, icon: Mail, color: 'text-terracotta', bg: 'bg-terracotta/10' },
                  { label: 'Authors', value: stats.authors, icon: Users, color: 'text-gold', bg: 'bg-gold/10' },
                  { label: 'Categories', value: stats.categories, icon: Tag, color: 'text-terracotta', bg: 'bg-terracotta/10' },
                  { label: 'Events', value: stats.events, icon: Calendar, color: 'text-forest', bg: 'bg-forest/10' },
                  { label: 'Makers', value: stats.makers, icon: BookmarkCheck, color: 'text-gold', bg: 'bg-gold/10' },
                ].map(stat => (
                  <div key={stat.label} className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      {stat.sub && <span className={`text-[10px] font-mono font-bold ${stat.subColor}`}>{stat.sub}</span>}
                    </div>
                    <p className="font-serif text-2xl md:text-3xl font-bold mt-3">{stat.value}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card">
                  <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Top Article Views
                  </h3>
                  {viewsChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={viewsChartData}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="oklch(0.37 0.14 350)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="oklch(0.37 0.14 350)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)' }} />
                        <Area type="monotone" dataKey="views" stroke="oklch(0.37 0.14 350)" fillOpacity={1} fill="url(#colorViews)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-12">No data yet</p>
                  )}
                </div>
                <div className="p-6 rounded-xl border border-border bg-card">
                  <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" /> Comments
                  </h3>
                  {commentPieData.length > 0 ? (
                    <div className="space-y-4">
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie data={commentPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                            {commentPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-4 text-xs">
                        {commentPieData.map((d, i) => (
                          <div key={d.name} className="flex items-center gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                            <span className="text-muted-foreground">{d.name}</span>
                            <span className="font-bold">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-12">No comments yet</p>
                  )}
                </div>
              </div>

              {/* Category chart + Quick actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card">
                  <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
                    <Palette className="h-4 w-4 text-gold" /> Category Distribution
                  </h3>
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={categoryData}>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)' }} />
                        <Bar dataKey="count" fill="oklch(0.72 0.14 55)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-12">No data yet</p>
                  )}
                </div>
                <div className="p-6 rounded-xl border border-border bg-card">
                  <h3 className="font-serif font-bold text-lg mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button onClick={() => navigate('new-article')} variant="outline" className="w-full justify-start gap-2"><Plus className="h-4 w-4" /> New Article</Button>
                    <Button onClick={() => { navigate('events'); setTimeout(openEvtCreate, 50) }} variant="outline" className="w-full justify-start gap-2"><Plus className="h-4 w-4" /> New Event</Button>
                    <Button onClick={() => { navigate('makers'); setTimeout(openMkrCreate, 50) }} variant="outline" className="w-full justify-start gap-2"><Plus className="h-4 w-4" /> New Maker</Button>
                    <Button onClick={() => { navigate('authors'); setTimeout(openAutCreate, 50) }} variant="outline" className="w-full justify-start gap-2"><Plus className="h-4 w-4" /> New Author</Button>
                    {stats.flaggedComments > 0 && (
                      <Button onClick={() => navigate('moderation')} className="w-full justify-start gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        <Shield className="h-4 w-4" /> Review {stats.flaggedComments} Flagged
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ MODERATION ═══════════════════ */}
          {activeTab === 'moderation' && (
            <div className="animate-fadeIn space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold">Comment Moderation</h2>
                  <p className="text-sm text-muted-foreground mt-1">Manage reported comments and moderation queue</p>
                </div>
                {modComments.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => bulkAction('published')} className="gap-1.5 text-xs">
                      <CheckCircle className="h-3.5 w-3.5" /> Restore All
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => bulkAction('removed')} className="gap-1.5 text-xs text-destructive hover:text-destructive">
                      <XCircle className="h-3.5 w-3.5" /> Remove All
                    </Button>
                  </div>
                )}
              </div>

              {/* Stats cards */}
              {modStats && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Published', value: modStats.published, color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-500/20' },
                    { label: 'Flagged', value: modStats.flagged, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
                    { label: 'Removed', value: modStats.removed, color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border' },
                  ].map(s => (
                    <button
                      key={s.label}
                      onClick={() => { setModStatus(s.label.toLowerCase()); setMmodPage(1) }}
                      className={`p-4 rounded-xl border text-left transition-all hover:shadow-md ${
                        modStatus === s.label.toLowerCase() ? `${s.border} ${s.bg} ring-1 ring-current/20` : 'border-border bg-card'
                      }`}
                    >
                      <p className={`font-serif text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{s.label}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Search & Filter bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by author, content, or article title..."
                    value={modSearch}
                    onChange={e => { setMmodSearch(e.target.value); setMmodPage(1) }}
                    className="pl-10 font-mono text-sm"
                  />
                </div>
                <Select value={modStatus} onValueChange={v => { setModStatus(v); setMmodPage(1) }}>
                  <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flagged">Flagged</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="removed">Removed</SelectItem>
                    <SelectItem value="all">All Comments</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Comments list */}
              {modLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : modComments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  {modStatus === 'flagged' ? (
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
                <>
                  <div className="space-y-3">
                    {modComments.map(c => {
                      const isFlagged = c.status === 'flagged'
                      const isRemoved = c.status === 'removed'
                      return (
                        <div
                          key={c.id}
                          className={`
                            p-4 rounded-xl border transition-all hover:shadow-sm
                            ${isFlagged ? 'border-destructive/30 bg-destructive/5' : isRemoved ? 'border-border bg-muted/50 opacity-70' : 'border-border bg-card'}
                          `}
                        >
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                              isFlagged ? 'bg-destructive/20 text-destructive' : 'bg-primary/10 text-primary'
                            }`}>
                              {c.author.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center flex-wrap gap-2 mb-1">
                                <span className="font-semibold text-sm">{c.author}</span>
                                {isFlagged && (
                                  <Badge variant="destructive" className="text-[10px] gap-1">
                                    <Flag className="h-2.5 w-2.5" /> {c.reportCount} report{c.reportCount !== 1 ? 's' : ''}
                                  </Badge>
                                )}
                                {isRemoved && (
                                  <Badge variant="secondary" className="text-[10px]">Removed</Badge>
                                )}
                                {c.status === 'published' && (
                                  <Badge variant="outline" className="text-[10px] text-green-600 border-green-200">Published</Badge>
                                )}
                                <span className="text-[10px] font-mono text-muted-foreground ml-auto">{timeAgo(c.createdAt)}</span>
                              </div>
                              <p className="text-sm text-foreground/80 mb-2 leading-relaxed">{c.content}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-mono">on:</span>
                                <a href={`/articles/${c.article.slug}`} target="_blank" className="text-primary hover:underline font-medium">
                                  {c.article.title}
                                </a>
                                <span className="text-border">|</span>
                                <span className="font-mono">{fmtDateTime(c.createdAt)}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              {isFlagged && (
                                <button
                                  onClick={() => moderateComment(c.id, 'published')}
                                  className="p-2 rounded-lg hover:bg-green-500/10 text-muted-foreground hover:text-green-600 transition-colors"
                                  title="Restore (publish)"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                              )}
                              {c.status !== 'removed' && (
                                <button
                                  onClick={() => moderateComment(c.id, 'removed')}
                                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                  title="Remove"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}
                              {c.status !== 'flagged' && (
                                <button
                                  onClick={() => moderateComment(c.id, 'flagged')}
                                  className="p-2 rounded-lg hover:bg-yellow-500/10 text-muted-foreground hover:text-yellow-600 transition-colors"
                                  title="Flag"
                                >
                                  <Flag className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteComment(c.id)}
                                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                title="Delete permanently"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Pagination */}
                  {modTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <Button
                        size="sm" variant="outline"
                        disabled={modPage <= 1}
                        onClick={() => setMmodPage(p => p - 1)}
                      >Previous</Button>
                      <span className="text-sm text-muted-foreground font-mono">
                        Page {modPage} of {modTotalPages}
                      </span>
                      <Button
                        size="sm" variant="outline"
                        disabled={modPage >= modTotalPages}
                        onClick={() => setMmodPage(p => p + 1)}
                      >Next</Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ═══════════════════ NEW ARTICLE (page) ═══════════════════ */}
          {activeTab === 'new-article' && (
            <div className="animate-fadeIn">
              {formDataLoading && categories.length === 0 && (
                <div className="flex items-center gap-2 py-8 justify-center text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading categories & authors…
                </div>
              )}
              {formDataError && categories.length === 0 && authors.length === 0 && !formDataLoading && (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <AlertTriangle className="h-8 w-8 text-amber-500/50" />
                  <p className="text-sm font-medium">{formDataError}</p>
                  <p className="text-xs text-muted-foreground max-w-sm">Make sure your database is configured. Categories and authors are required to create an article.</p>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fetchFormDependencies()}>
                    <RotateCcw className="h-3.5 w-3.5" /> Retry
                  </Button>
                </div>
              )}
              {(categories.length > 0 || authors.length > 0) && (
                <>
                  {formDataError && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/20 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-200">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {formDataError} — some dropdowns may be empty
                    </div>
                  )}
                  <ArticleForm
                    mode='create'
                    variant='page'
                    categories={categories.map(c => ({ id: c.id, name: c.name, color: c.color }))}
                    authors={authors.map(a => ({ id: a.id, name: a.name, role: a.role }))}
                    onSubmit={async (data: ArticleFormData) => {
                      const res = await fetch('/api/admin/articles', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...data, readTime: parseInt(data.readTime) || 5 }),
                      })
                      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to create article') }
                      await fetchAll()
                      navigate('articles')
                    }}
                    onCancel={() => navigate('articles')}
                  />
                </>
              )}
            </div>
          )}

          {/* ═══════════════════ ARTICLES ═══════════════════ */}
          {activeTab === 'articles' && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold">Articles ({articles.length})</h2>
                  <p className="text-sm text-muted-foreground mt-1">Manage your published content</p>
                </div>
                <Button onClick={() => navigate('new-article')} className="gap-2"><Plus className="h-4 w-4" /> New Article</Button>
              </div>
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/50 border-b border-border">
                        <th className={thCls}>Title</th>
                        <th className={`${thCls} hidden md:table-cell`}>Category</th>
                        <th className={`${thCls} hidden lg:table-cell`}>Author</th>
                        <th className={`${thCls} text-right`}>Views</th>
                        <th className={`${thCls} text-center`}>Status</th>
                        <th className={`${thCls} text-right`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map(article => (
                        <tr key={article.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                          <td className={tdCls}>
                            <p className="font-serif font-semibold text-sm line-clamp-1">{article.title}</p>
                            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{fmtDate(article.publishedAt)}</p>
                          </td>
                          <td className={`${tdCls} hidden md:table-cell`}>
                            <Badge className="text-[10px]" style={{ backgroundColor: article.category.color + '20', color: article.category.color }}>{article.category.name}</Badge>
                          </td>
                          <td className={`${tdCls} text-sm text-muted-foreground hidden lg:table-cell`}>{article.author.name}</td>
                          <td className={`${tdCls} text-right`}><span className="font-mono text-sm">{article.views}</span></td>
                          <td className={`${tdCls}`}>
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => toggleArtFeatured(article)} className={`p-1 rounded ${article.isFeatured ? 'text-gold' : 'text-muted-foreground/30 hover:text-gold/50'}`} title="Featured">
                                <Star className="h-3.5 w-3.5" fill={article.isFeatured ? 'currentColor' : 'none'} />
                              </button>
                              <button onClick={() => toggleArtPinned(article)} className={`p-1 rounded ${article.isPinned ? 'text-primary' : 'text-muted-foreground/30 hover:text-primary/50'}`} title="Pinned">
                                <Pin className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className={`${tdCls} text-right`}>
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openArtEdit(article)} className={actionBtnCls} title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                              <a href={`/articles/${article.slug}`} target="_blank" className={actionBtnCls} title="View"><ExternalLink className="h-3.5 w-3.5" /></a>
                              <button onClick={() => deleteArt(article.id)} className={`${actionBtnCls} hover:bg-destructive/10 hover:text-destructive`} title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ EVENTS ═══════════════════ */}
          {activeTab === 'events' && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold">Events ({events.length})</h2>
                  <p className="text-sm text-muted-foreground mt-1">Manage upcoming and past events</p>
                </div>
                <Button onClick={openEvtCreate} className="gap-2"><Plus className="h-4 w-4" /> New Event</Button>
              </div>
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/50 border-b border-border">
                        <th className={thCls}>Title</th>
                        <th className={`${thCls} hidden md:table-cell`}>Date</th>
                        <th className={`${thCls} hidden lg:table-cell`}>Venue</th>
                        <th className={`${thCls} hidden lg:table-cell`}>City</th>
                        <th className={`${thCls} text-center`}>Status</th>
                        <th className={`${thCls} text-right`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(evt => (
                        <tr key={evt.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                          <td className={tdCls}>
                            <p className="font-serif font-semibold text-sm line-clamp-1">{evt.title}</p>
                            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{evt.category}</p>
                          </td>
                          <td className={`${tdCls} text-sm text-muted-foreground hidden md:table-cell`}>{fmtDate(evt.date)}</td>
                          <td className={`${tdCls} text-sm text-muted-foreground hidden lg:table-cell`}>{evt.venue}</td>
                          <td className={`${tdCls} text-sm text-muted-foreground hidden lg:table-cell`}>{evt.city}</td>
                          <td className={`${tdCls}`}>
                            <div className="flex items-center justify-center gap-1">
                              <Badge variant={evt.isPast ? 'secondary' : 'outline'} className="text-[10px]">{evt.isPast ? 'Past' : 'Upcoming'}</Badge>
                              {evt.isFeatured && <Star className="h-3 w-3 text-gold" fill="currentColor" />}
                            </div>
                          </td>
                          <td className={`${tdCls} text-right`}>
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openEvtEdit(evt)} className={actionBtnCls} title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                              <button onClick={() => deleteEvt(evt.id)} className={`${actionBtnCls} hover:bg-destructive/10 hover:text-destructive`} title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ MAKERS ═══════════════════ */}
          {activeTab === 'makers' && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold">Makers ({makers.length})</h2>
                  <p className="text-sm text-muted-foreground mt-1">Cultural artisans and creatives</p>
                </div>
                <Button onClick={openMkrCreate} className="gap-2"><Plus className="h-4 w-4" /> New Maker</Button>
              </div>
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/50 border-b border-border">
                        <th className={thCls}>Name</th>
                        <th className={`${thCls} hidden md:table-cell`}>Discipline</th>
                        <th className={`${thCls} hidden lg:table-cell`}>Location</th>
                        <th className={`${thCls} text-center`}>Featured</th>
                        <th className={`${thCls} text-right`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {makers.map(mkr => (
                        <tr key={mkr.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                          <td className={tdCls}>
                            <div className="flex items-center gap-2">
                              {mkr.avatar ? (
                                <img src={mkr.avatar} alt={mkr.name} className="h-7 w-7 rounded-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                              ) : (
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{mkr.name.charAt(0)}</div>
                              )}
                              <div>
                                <p className="font-serif font-semibold text-sm">{mkr.name}</p>
                                <p className="text-[10px] font-mono text-muted-foreground">{mkr.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className={`${tdCls} text-sm text-muted-foreground hidden md:table-cell`}>{mkr.discipline}</td>
                          <td className={`${tdCls} text-sm text-muted-foreground hidden lg:table-cell`}>{mkr.location}</td>
                          <td className={`${tdCls}`}>
                            <div className="flex justify-center">
                              {mkr.isFeatured ? <Star className="h-4 w-4 text-gold" fill="currentColor" /> : <span className="text-muted-foreground/30">—</span>}
                            </div>
                          </td>
                          <td className={`${tdCls} text-right`}>
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openMkrEdit(mkr)} className={actionBtnCls} title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                              <button onClick={() => deleteMkr(mkr.id)} className={`${actionBtnCls} hover:bg-destructive/10 hover:text-destructive`} title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ AUTHORS ═══════════════════ */}
          {activeTab === 'authors' && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold">Authors ({authors.length})</h2>
                  <p className="text-sm text-muted-foreground mt-1">Writers, editors, and contributors</p>
                </div>
                <Button onClick={openAutCreate} className="gap-2"><Plus className="h-4 w-4" /> New Author</Button>
              </div>
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/50 border-b border-border">
                        <th className={thCls}>Name</th>
                        <th className={`${thCls} hidden md:table-cell`}>Role</th>
                        <th className={`${thCls} hidden lg:table-cell`}>Articles</th>
                        <th className={`${thCls} text-right`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {authors.map(aut => (
                        <tr key={aut.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                          <td className={tdCls}>
                            <div className="flex items-center gap-2">
                              {aut.avatar ? (
                                <img src={aut.avatar} alt={aut.name} className="h-7 w-7 rounded-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                              ) : (
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{aut.name.charAt(0)}</div>
                              )}
                              <div>
                                <p className="font-serif font-semibold text-sm">{aut.name}</p>
                                <p className="text-[10px] font-mono text-muted-foreground">{aut.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className={`${tdCls} hidden md:table-cell`}>
                            <Badge variant="outline" className="text-[10px]">{aut.role}</Badge>
                          </td>
                          <td className={`${tdCls} text-sm text-muted-foreground hidden lg:table-cell`}>{aut._count?.articles || 0}</td>
                          <td className={`${tdCls} text-right`}>
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openAutEdit(aut)} className={actionBtnCls} title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                              <button onClick={() => deleteAut(aut.id)} className={`${actionBtnCls} hover:bg-destructive/10 hover:text-destructive`} title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ CATEGORIES ═══════════════════ */}
          {activeTab === 'categories' && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold">Categories ({categories.length})</h2>
                  <p className="text-sm text-muted-foreground mt-1">Organize your content sections</p>
                </div>
                <Button onClick={openCatCreate} className="gap-2"><Plus className="h-4 w-4" /> New Category</Button>
              </div>
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/50 border-b border-border">
                        <th className={thCls}>Color</th>
                        <th className={thCls}>Name</th>
                        <th className={`${thCls} hidden md:table-cell`}>Slug</th>
                        <th className={`${thCls} hidden lg:table-cell`}>Articles</th>
                        <th className={`${thCls} hidden lg:table-cell`}>Events</th>
                        <th className={`${thCls} text-right`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(cat => (
                        <tr key={cat.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                          <td className={tdCls}>
                            <div className="h-6 w-6 rounded-full border border-border" style={{ backgroundColor: cat.color }} />
                          </td>
                          <td className={tdCls}>
                            <p className="font-serif font-semibold text-sm">{cat.name}</p>
                          </td>
                          <td className={`${tdCls} font-mono text-sm text-muted-foreground hidden md:table-cell`}>{cat.slug}</td>
                          <td className={`${tdCls} text-sm text-muted-foreground hidden lg:table-cell`}>{cat._count?.articles || 0}</td>
                          <td className={`${tdCls} text-sm text-muted-foreground hidden lg:table-cell`}>{cat._count?.events || 0}</td>
                          <td className={`${tdCls} text-right`}>
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openCatEdit(cat)} className={actionBtnCls} title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                              <button onClick={() => deleteCat(cat.id)} className={`${actionBtnCls} hover:bg-destructive/10 hover:text-destructive`} title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ SUBSCRIBERS ═══════════════════ */}
          {activeTab === 'media' && (
            <div className="animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold">Media Library{mediaTotal > 0 ? ` (${mediaTotal})` : ''}</h2>
                  <p className="text-sm text-muted-foreground mt-1">Upload, browse, and manage CDN images</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={mediaUploadFolder} onValueChange={v => setMediaUploadFolder(v as CDNFolder)}>
                    <SelectTrigger className="w-32 text-xs h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CDN_FOLDERS.map(f => <SelectItem key={f} value={f} className="text-xs capitalize">{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
                    {mediaUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {mediaUploading ? 'Uploading…' : 'Upload'}
                    <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/avif" onChange={handleMediaUpload} disabled={mediaUploading} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={mediaSearch} onChange={e => { setMediaSearch(e.target.value); setMediaPage(1) }} placeholder="Search files…" className="pl-9 text-sm" />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <button onClick={() => { setMediaFolder(''); setMediaPage(1) }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mediaFolder === '' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>All</button>
                  {CDN_FOLDERS.map(f => (
                    <button key={f} onClick={() => { setMediaFolder(f); setMediaPage(1) }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${mediaFolder === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>{f}</button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              {mediaLoading ? (
                <div className="flex items-center justify-center py-24 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-3" /> Loading media…
                </div>
              ) : mediaFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/20 mb-4" />
                  <p className="text-sm font-medium text-muted-foreground">No media files found</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Upload images or change the folder filter</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {mediaFiles.map(file => (
                      <div key={file.path} className="group relative rounded-xl overflow-hidden border border-border bg-secondary aspect-square">
                        <img src={file.url} alt={file.filename} className="w-full h-full object-cover" loading="lazy" />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                          <p className="text-[10px] font-mono text-white truncate mb-1">{file.filename}</p>
                          <p className="text-[9px] text-white/60 font-mono">{formatSize(file.size)}</p>
                        </div>
                        {/* Action buttons */}
                        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => copyToClipboard(file.url)} className="p-1.5 rounded-md bg-black/60 text-white hover:bg-black/80 transition-colors" title="Copy URL">
                            {copiedUrl === file.url ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                          <button onClick={() => setMediaPreview(file)} className="p-1.5 rounded-md bg-black/60 text-white hover:bg-black/80 transition-colors" title="Preview">
                            <Eye className="h-3 w-3" />
                          </button>
                          <button onClick={() => handleMediaDelete(file)} disabled={mediaDeleting === file.path} className="p-1.5 rounded-md bg-black/60 text-white hover:bg-red-600 transition-colors" title="Delete">
                            {mediaDeleting === file.path ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {mediaTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <button onClick={() => setMediaPage(p => Math.max(1, p - 1))} disabled={mediaPage <= 1} className="px-3 py-1.5 rounded-lg text-xs bg-secondary hover:bg-secondary/80 disabled:opacity-40 transition-colors">Prev</button>
                      <span className="text-xs text-muted-foreground font-mono">Page {mediaPage} of {mediaTotalPages}</span>
                      <button onClick={() => setMediaPage(p => Math.min(mediaTotalPages, p + 1))} disabled={mediaPage >= mediaTotalPages} className="px-3 py-1.5 rounded-lg text-xs bg-secondary hover:bg-secondary/80 disabled:opacity-40 transition-colors">Next</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Image Preview Modal */}
          {mediaPreview && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setMediaPreview(null)}>
              <div className="relative max-w-4xl w-[92vw] max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-white truncate max-w-[60vw]">{mediaPreview.filename}</p>
                    <p className="text-[10px] font-mono text-white/50">{mediaPreview.path} · {formatSize(mediaPreview.size)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => copyToClipboard(mediaPreview.url)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition-colors">
                      {copiedUrl === mediaPreview.url ? <><Check className="h-3 w-3 text-green-400" /> Copied</> : <><Copy className="h-3 w-3" /> Copy URL</>}
                    </button>
                    <button onClick={() => setMediaPreview(null)} className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden rounded-xl">
                  <img src={mediaPreview.url} alt={mediaPreview.filename} className="w-full h-full max-h-[75vh] object-contain rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscribers' && (
            <div className="animate-fadeIn">
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-bold">Newsletter Subscribers ({subscribers.length})</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage your mailing list</p>
              </div>
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/50 border-b border-border">
                        <th className={thCls}>Name</th>
                        <th className={thCls}>Email</th>
                        <th className={`${thCls} hidden md:table-cell`}>Subscribed</th>
                        <th className={`${thCls} text-right`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map(sub => (
                        <tr key={sub.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                          <td className={tdCls}>
                            <p className="font-serif font-semibold text-sm">{sub.name || '—'}</p>
                          </td>
                          <td className={tdCls}>
                            <p className="font-mono text-sm text-muted-foreground">{sub.email}</p>
                          </td>
                          <td className={`${tdCls} text-sm text-muted-foreground hidden md:table-cell`}>{fmtDate(sub.createdAt)}</td>
                          <td className={`${tdCls} text-right`}>
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => deleteSub(sub.id)} className={`${actionBtnCls} hover:bg-destructive/10 hover:text-destructive`} title="Remove"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ═══════════════════ DIALOGS ═══════════════════ */}

      {/* Article Edit Dialog (create uses page tab) */}
      {artEdit && (
      <Dialog open={artDialog} onOpenChange={setArtDialog}>
        <DialogContent className="max-w-6xl max-h-[92vh] overflow-hidden w-[97vw] sm:w-full p-0">
          <ArticleForm
            key={artEdit.id}
            mode='edit'
            variant='dialog'
            categories={categories.map(c => ({ id: c.id, name: c.name, color: c.color }))}
            authors={authors.map(a => ({ id: a.id, name: a.name, role: a.role }))}
            initialData={{
              title: artEdit.title, slug: artEdit.slug, excerpt: artEdit.excerpt,
              coverImage: artEdit.coverImage || '',
              categoryId: categories.find(c => c.name === artEdit.category?.name)?.id || '',
              authorId: artEdit.author?.id || '',
              tags: artEdit.tags || '',
              readTime: String(artEdit.readTime || 5),
              isFeatured: artEdit.isFeatured, isPinned: artEdit.isPinned,
            }}
            onSubmit={async (data: ArticleFormData) => {
              const res = await fetch(`/api/admin/articles/${artEdit.id}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, readTime: parseInt(data.readTime) || 5 }),
              })
              if (res.ok) { const updated = await res.json(); setArticles(p => p.map(a => a.id === artEdit.id ? { ...a, ...updated } : a)); fetchAll() }
              setArtDialog(false)
            }}
            onCancel={() => setArtDialog(false)}
          />
        </DialogContent>
      </Dialog>
      )}

      {/* Event Dialog */}
      <Dialog open={evtDialog} onOpenChange={setEvtDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{evtEdit ? 'Edit Event' : 'New Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Title *</label>
              <Input value={evtTitle} onChange={e => setEvtTitle(e.target.value)} placeholder="Event title" />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <Textarea value={evtDesc} onChange={e => setEvtDesc(e.target.value)} placeholder="Event description..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Date *</label>
                <Input type="datetime-local" value={evtDate} onChange={e => setEvtDate(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>End Date (optional)</label>
                <Input type="datetime-local" value={evtEndDate} onChange={e => setEvtEndDate(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Venue *</label>
                <Input value={evtVenue} onChange={e => setEvtVenue(e.target.value)} placeholder="Venue name" />
              </div>
              <div>
                <label className={labelCls}>City *</label>
                <Input value={evtCity} onChange={e => setEvtCity(e.target.value)} placeholder="Nairobi" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <Input value={evtCategory} onChange={e => setEvtCategory(e.target.value)} placeholder="e.g. Exhibition, Workshop, Concert" />
            </div>
            <ImageUpload
              value={evtImageUrl}
              onChange={setEvtImageUrl}
              folder="events"
              label="Event Image"
              placeholder="Upload or paste a CDN URL…"
            />
            <div>
              <label className={labelCls}>Ticket URL</label>
              <Input value={evtTicketUrl} onChange={e => setEvtTicketUrl(e.target.value)} placeholder="https://ticketsite.com/..." className="font-mono text-sm" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={evtFeatured} onCheckedChange={setEvtFeatured} />
                <label className={labelCls + ' mb-0'}>Featured</label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={evtPast} onCheckedChange={setEvtPast} />
                <label className={labelCls + ' mb-0'}>Past Event</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setEvtDialog(false)}>Cancel</Button>
              <Button onClick={saveEvt} disabled={evtSaving || !evtTitle || !evtDate || !evtVenue || !evtCity} className="font-mono text-xs">
                {evtSaving ? 'Saving...' : evtEdit ? 'Update' : 'Create Event'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Maker Dialog */}
      <Dialog open={mkrDialog} onOpenChange={setMkrDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{mkrEdit ? 'Edit Maker' : 'New Maker'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Name *</label>
                <Input value={mkrName} onChange={e => { setMkrName(e.target.value); if (!mkrEdit) setMkrSlug(slugify(e.target.value)) }} placeholder="Maker name" />
              </div>
              <div>
                <label className={labelCls}>Slug *</label>
                <Input value={mkrSlug} onChange={e => setMkrSlug(e.target.value)} placeholder="maker-slug" className="font-mono" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Discipline *</label>
              <Input value={mkrDiscipline} onChange={e => setMkrDiscipline(e.target.value)} placeholder="e.g. Ceramicist, Painter, Sculptor" />
            </div>
            <div>
              <label className={labelCls}>Bio</label>
              <Textarea value={mkrBio} onChange={e => setMkrBio(e.target.value)} placeholder="Biography..." rows={3} />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <Input value={mkrLocation} onChange={e => setMkrLocation(e.target.value)} placeholder="Nairobi, Kenya" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Website</label>
                <Input value={mkrWebsite} onChange={e => setMkrWebsite(e.target.value)} placeholder="https://..." className="font-mono text-sm" />
              </div>
              <div>
                <label className={labelCls}>Instagram</label>
                <Input value={mkrInstagram} onChange={e => setMkrInstagram(e.target.value)} placeholder="@handle" className="font-mono text-sm" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Twitter / X</label>
              <Input value={mkrTwitter} onChange={e => setMkrTwitter(e.target.value)} placeholder="@handle" className="font-mono text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={mkrFeatured} onCheckedChange={setMkrFeatured} />
              <label className={labelCls + ' mb-0'}>Featured</label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setMkrDialog(false)}>Cancel</Button>
              <Button onClick={saveMkr} disabled={mkrSaving || !mkrName || !mkrSlug || !mkrDiscipline} className="font-mono text-xs">
                {mkrSaving ? 'Saving...' : mkrEdit ? 'Update' : 'Create Maker'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Author Dialog */}
      <Dialog open={autDialog} onOpenChange={setAutDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{autEdit ? 'Edit Author' : 'New Author'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Name *</label>
                <Input value={autName} onChange={e => { setAutName(e.target.value); if (!autEdit) setAutSlug(slugify(e.target.value)) }} placeholder="Author name" />
              </div>
              <div>
                <label className={labelCls}>Slug *</label>
                <Input value={autSlug} onChange={e => setAutSlug(e.target.value)} placeholder="author-slug" className="font-mono" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Role</label>
              <Select value={autRole} onValueChange={setAutRole}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Writer">Writer</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                  <SelectItem value="Contributor">Contributor</SelectItem>
                  <SelectItem value="Columnist">Columnist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={labelCls}>Bio</label>
              <Textarea value={autBio} onChange={e => setAutBio(e.target.value)} placeholder="Author biography..." rows={3} />
            </div>
            <ImageUpload
              value={autAvatar}
              onChange={setAutAvatar}
              folder="profiles"
              label="Avatar"
              previewClass="aspect-square w-16 h-16 rounded-full"
              placeholder="Upload or paste a CDN URL…"
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setAutDialog(false)}>Cancel</Button>
              <Button onClick={saveAut} disabled={autSaving || !autName || !autSlug} className="font-mono text-xs">
                {autSaving ? 'Saving...' : autEdit ? 'Update' : 'Create Author'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{catEdit ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Name *</label>
                <Input value={catName} onChange={e => { setCatName(e.target.value); if (!catEdit) setCatSlug(slugify(e.target.value)) }} placeholder="Category name" />
              </div>
              <div>
                <label className={labelCls}>Slug *</label>
                <Input value={catSlug} onChange={e => setCatSlug(e.target.value)} placeholder="category-slug" className="font-mono" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <Textarea value={catDescription} onChange={e => setCatDescription(e.target.value)} placeholder="Category description..." rows={2} />
            </div>
            <div>
              <label className={labelCls}>Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={catColor} onChange={e => setCatColor(e.target.value)} className="h-10 w-10 rounded-md border border-border cursor-pointer p-0" />
                <Input value={catColor} onChange={e => setCatColor(e.target.value)} placeholder="#8B2252" className="font-mono text-sm w-32" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setCatDialog(false)}>Cancel</Button>
              <Button onClick={saveCat} disabled={catSaving || !catName || !catSlug} className="font-mono text-xs">
                {catSaving ? 'Saving...' : catEdit ? 'Update' : 'Create Category'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}