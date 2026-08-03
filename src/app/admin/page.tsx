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
  TrendingUp, ImageIcon, Pencil, ExternalLink, Palette,
} from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

// ── Interfaces ──────────────────────────────────────────────

interface Article {
  id: string; title: string; slug: string; excerpt: string
  publishedAt: string; views: number; isFeatured: boolean; isPinned: boolean
  category: { name: string; color: string }; author: { name: string }
  commentCount: number
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

interface Stats {
  articles: number; authors: number; categories: number; events: number
  comments: number; makers: number; subscribers: number; totalViews: number
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

const labelCls = 'font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1'
const thCls = 'text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground'
const tdCls = 'px-4 py-3'
const actionBtnCls = 'p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground'

// ── Component ───────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<string>('overview')

  // Data
  const [stats, setStats] = useState<Stats | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [makers, setMakers] = useState<MakerItem[]>([])
  const [authors, setAuthors] = useState<AuthorItem[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([])

  // Article form
  const [artDialog, setArtDialog] = useState(false)
  const [artEdit, setArtEdit] = useState<Article | null>(null)
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
    const endpoints = [
      ['stats', '/api/admin/stats', setStats],
      ['articles', '/api/admin/articles', setArticles],
      ['events', '/api/admin/events', setEvents],
      ['makers', '/api/admin/makers', setMakers],
      ['authors', '/api/admin/authors', setAuthors],
      ['categories', '/api/admin/categories', setCategories],
      ['subscribers', '/api/admin/subscribers', setSubscribers],
    ] as const
    await Promise.all(
      endpoints.map(([, url, setter]) =>
        fetch(url).then(r => r.json()).then(d => setter(d)).catch(() => {})
      )
    )
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

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
  const saveArt = async () => {
    if (!artTitle || !artSlug) return
    setArtSaving(true)
    try {
      if (artEdit) {
        const res = await fetch(`/api/admin/articles/${artEdit.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: artTitle, slug: artSlug, excerpt: artExcerpt, coverImage: artCoverImage }),
        })
        if (res.ok) { const u = await res.json(); setArticles(p => p.map(a => a.id === u.id ? { ...a, ...u } : a)) }
      } else {
        const catId = categories.find(c => c.name === artCategory)?.id || ''
        const authId = authors.find(a => a.name === artAuthor)?.id || ''
        if (!catId || !authId) { setArtSaving(false); return }
        const res = await fetch('/api/admin/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: artTitle, slug: artSlug, excerpt: artExcerpt, content: artContent, coverImage: artCoverImage, categoryId: catId, authorId: authId, readTime: parseInt(artReadTime) || 5, tags: artTags }),
        })
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
    setEvtEdit(null)
    setEvtTitle(''); setEvtDesc(''); setEvtDate(''); setEvtEndDate('')
    setEvtVenue(''); setEvtCity(''); setEvtCategory('')
    setEvtImageUrl(''); setEvtTicketUrl('')
    setEvtFeatured(false); setEvtPast(false)
    setEvtDialog(true)
  }
  const openEvtEdit = (e: EventItem) => {
    setEvtEdit(e)
    setEvtTitle(e.title); setEvtDesc(e.description)
    setEvtDate(toDatetimeLocal(e.date)); setEvtEndDate(e.endDate ? toDatetimeLocal(e.endDate) : '')
    setEvtVenue(e.venue); setEvtCity(e.city); setEvtCategory(e.category)
    setEvtImageUrl(e.imageUrl); setEvtTicketUrl(e.ticketUrl)
    setEvtFeatured(e.isFeatured); setEvtPast(e.isPast)
    setEvtDialog(true)
  }
  const saveEvt = async () => {
    if (!evtTitle || !evtDate || !evtVenue || !evtCity) return
    setEvtSaving(true)
    try {
      const payload = {
        title: evtTitle, description: evtDesc, date: evtDate,
        endDate: evtEndDate || null, venue: evtVenue, city: evtCity,
        category: evtCategory, imageUrl: evtImageUrl, ticketUrl: evtTicketUrl,
        isFeatured: evtFeatured, isPast: evtPast,
      }
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
    setMkrEdit(null)
    setMkrName(''); setMkrSlug(''); setMkrDiscipline(''); setMkrBio('')
    setMkrLocation(''); setMkrWebsite(''); setMkrInstagram(''); setMkrTwitter('')
    setMkrFeatured(false)
    setMkrDialog(true)
  }
  const openMkrEdit = (m: MakerItem) => {
    setMkrEdit(m)
    setMkrName(m.name); setMkrSlug(m.slug); setMkrDiscipline(m.discipline)
    setMkrBio(m.bio); setMkrLocation(m.location); setMkrWebsite(m.website)
    setMkrInstagram(m.instagram); setMkrTwitter(m.twitter)
    setMkrFeatured(m.isFeatured)
    setMkrDialog(true)
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
    setAutEdit(null)
    setAutName(''); setAutSlug(''); setAutBio(''); setAutAvatar(''); setAutRole('Writer')
    setAutDialog(true)
  }
  const openAutEdit = (a: AuthorItem) => {
    setAutEdit(a)
    setAutName(a.name); setAutSlug(a.slug); setAutBio(a.bio); setAutAvatar(a.avatar); setAutRole(a.role)
    setAutDialog(true)
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
    setCatEdit(null)
    setCatName(''); setCatSlug(''); setCatDescription(''); setCatColor('#8B2252')
    setCatDialog(true)
  }
  const openCatEdit = (c: CategoryItem) => {
    setCatEdit(c)
    setCatName(c.name); setCatSlug(c.slug); setCatDescription(c.description); setCatColor(c.color)
    setCatDialog(true)
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

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-mono text-xs">Back to Site</span>
            </Link>
            <span className="text-border">|</span>
            <span className="font-serif font-bold text-lg">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Editor</Link>
            <span className="text-border">|</span>
            <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/login' }} className="text-xs text-muted-foreground hover:text-destructive transition-colors">Logout</button>
            <Badge variant="outline" className="font-mono text-[10px]">Sanaa CMS</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1.5" />Overview</TabsTrigger>
            <TabsTrigger value="articles"><FileText className="h-4 w-4 mr-1.5" />Articles</TabsTrigger>
            <TabsTrigger value="events"><Calendar className="h-4 w-4 mr-1.5" />Events</TabsTrigger>
            <TabsTrigger value="makers"><BookmarkCheck className="h-4 w-4 mr-1.5" />Makers</TabsTrigger>
            <TabsTrigger value="authors"><Users className="h-4 w-4 mr-1.5" />Authors</TabsTrigger>
            <TabsTrigger value="categories"><Tag className="h-4 w-4 mr-1.5" />Categories</TabsTrigger>
            <TabsTrigger value="subscribers"><Mail className="h-4 w-4 mr-1.5" />Subscribers</TabsTrigger>
          </TabsList>

          {/* ═══════════════════ OVERVIEW ═══════════════════ */}
          <TabsContent value="overview">
            {stats && (
              <div className="animate-fadeIn">
                <h2 className="font-serif text-2xl font-bold mb-6">Dashboard Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Articles', value: stats.articles, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Authors', value: stats.authors, icon: Users, color: 'text-gold', bg: 'bg-gold/10' },
                    { label: 'Categories', value: stats.categories, icon: Tag, color: 'text-terracotta', bg: 'bg-terracotta/10' },
                    { label: 'Events', value: stats.events, icon: Calendar, color: 'text-forest', bg: 'bg-forest/10' },
                    { label: 'Comments', value: stats.comments, icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Makers', value: stats.makers, icon: Star, color: 'text-gold', bg: 'bg-gold/10' },
                    { label: 'Subscribers', value: stats.subscribers, icon: Mail, color: 'text-terracotta', bg: 'bg-terracotta/10' },
                    { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-forest', bg: 'bg-forest/10' },
                  ].map(stat => (
                    <div key={stat.label} className="p-5 rounded-xl border border-border bg-card hover-card">
                      <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <p className="font-serif text-2xl md:text-3xl font-bold">{stat.value}</p>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-xl border border-border bg-card">
                    <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Article Views
                    </h3>
                    {viewsChartData.length > 0 && (
                      <ResponsiveContainer width="100%" height={220}>
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
                    )}
                  </div>
                  <div className="p-6 rounded-xl border border-border bg-card">
                    <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gold" /> Category Distribution
                    </h3>
                    {categoryData.length > 0 && (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={categoryData}>
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)' }} />
                          <Bar dataKey="count" fill="oklch(0.72 0.14 55)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => { setActiveTab('articles'); setTimeout(openArtCreate, 50) }} className="gap-2"><Plus className="h-4 w-4" /> New Article</Button>
                    <Button variant="outline" onClick={() => { setActiveTab('events'); setTimeout(openEvtCreate, 50) }} className="gap-2"><Plus className="h-4 w-4" /> New Event</Button>
                    <Button variant="outline" onClick={() => { setActiveTab('makers'); setTimeout(openMkrCreate, 50) }} className="gap-2"><Plus className="h-4 w-4" /> New Maker</Button>
                    <Button variant="outline" onClick={() => { setActiveTab('authors'); setTimeout(openAutCreate, 50) }} className="gap-2"><Plus className="h-4 w-4" /> New Author</Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ═══════════════════ ARTICLES ═══════════════════ */}
          <TabsContent value="articles">
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold">Articles ({articles.length})</h2>
                <Button onClick={openArtCreate} className="gap-2"><Plus className="h-4 w-4" /> New Article</Button>
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
          </TabsContent>

          {/* ═══════════════════ EVENTS ═══════════════════ */}
          <TabsContent value="events">
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold">Events ({events.length})</h2>
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
          </TabsContent>

          {/* ═══════════════════ MAKERS ═══════════════════ */}
          <TabsContent value="makers">
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold">Makers ({makers.length})</h2>
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
                            <p className="font-serif font-semibold text-sm">{mkr.name}</p>
                            <p className="text-[10px] font-mono text-muted-foreground">{mkr.slug}</p>
                          </td>
                          <td className={`${tdCls} text-sm text-muted-foreground hidden md:table-cell`}>{mkr.discipline}</td>
                          <td className={`${tdCls} text-sm text-muted-foreground hidden lg:table-cell`}>{mkr.location}</td>
                          <td className={`${tdCls}`}>
                            <div className="flex justify-center">
                              {mkr.isFeatured && <Star className="h-4 w-4 text-gold" fill="currentColor" />}
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
          </TabsContent>

          {/* ═══════════════════ AUTHORS ═══════════════════ */}
          <TabsContent value="authors">
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold">Authors ({authors.length})</h2>
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
                              {aut.avatar && <img src={aut.avatar} alt={aut.name} className="h-7 w-7 rounded-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />}
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
          </TabsContent>

          {/* ═══════════════════ CATEGORIES ═══════════════════ */}
          <TabsContent value="categories">
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold">Categories ({categories.length})</h2>
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
          </TabsContent>

          {/* ═══════════════════ SUBSCRIBERS ═══════════════════ */}
          <TabsContent value="subscribers">
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold">Newsletter Subscribers ({subscribers.length})</h2>
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
          </TabsContent>
        </Tabs>
      </main>

      {/* ═══════════════════ ARTICLE DIALOG ═══════════════════ */}
      <Dialog open={artDialog} onOpenChange={setArtDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{artEdit ? 'Edit Article' : 'New Article'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Title *</label>
              <Input value={artTitle} onChange={e => { setArtTitle(e.target.value); if (!artEdit) setArtSlug(slugify(e.target.value)) }} placeholder="Article title" />
            </div>
            <div>
              <label className={labelCls}>Slug *</label>
              <Input value={artSlug} onChange={e => setArtSlug(e.target.value)} placeholder="article-slug" className="font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Category</label>
                <Select value={artCategory} onValueChange={setArtCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={labelCls}>Author</label>
                <Select value={artAuthor} onValueChange={setArtAuthor}>
                  <SelectTrigger><SelectValue placeholder="Select author" /></SelectTrigger>
                  <SelectContent>
                    {authors.map(a => <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Excerpt</label>
              <Textarea value={artExcerpt} onChange={e => setArtExcerpt(e.target.value)} placeholder="Brief summary..." rows={2} />
            </div>
            {!artEdit && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={labelCls}>Content (Markdown)</label>
                  {artContent && <span className="font-mono text-[10px] text-muted-foreground">{artContent.split(/\s+/).filter(Boolean).length} words</span>}
                </div>
                <Tabs defaultValue="write" className="mt-2">
                  <TabsList className="mb-2">
                    <TabsTrigger value="write" className="text-xs">Write</TabsTrigger>
                    <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="write">
                    <Textarea value={artContent} onChange={e => setArtContent(e.target.value)} placeholder="Write your article in Markdown..." rows={8} className="font-mono text-sm" />
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="border border-border rounded-xl p-4 min-h-[200px] prose-article">
                      {artContent ? <ReactMarkdown>{artContent}</ReactMarkdown> : <p className="text-muted-foreground text-sm italic">Start writing to see a preview...</p>}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
            <div>
              <label className={labelCls}>Cover Image URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={artCoverImage} onChange={e => setArtCoverImage(e.target.value)} placeholder="https://images.unsplash.com/..." className="font-mono text-sm pl-10" />
              </div>
              {artCoverImage && (
                <div className="mt-2 rounded-lg overflow-hidden border border-border aspect-video bg-secondary">
                  <img src={artCoverImage} alt="Cover preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Tags</label>
                <Input value={artTags} onChange={e => setArtTags(e.target.value)} placeholder="tag1, tag2, tag3" />
              </div>
              <div>
                <label className={labelCls}>Read Time (min)</label>
                <Input type="number" value={artReadTime} onChange={e => setArtReadTime(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setArtDialog(false)}>Cancel</Button>
              <Button onClick={saveArt} disabled={artSaving || !artTitle || !artSlug} className="font-mono text-xs">
                {artSaving ? 'Saving...' : artEdit ? 'Update' : 'Create Article'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════ EVENT DIALOG ═══════════════════ */}
      <Dialog open={evtDialog} onOpenChange={setEvtDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <div>
              <label className={labelCls}>Image URL</label>
              <Input value={evtImageUrl} onChange={e => setEvtImageUrl(e.target.value)} placeholder="https://..." className="font-mono text-sm" />
              {evtImageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-border aspect-video bg-secondary">
                  <img src={evtImageUrl} alt="Event preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
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

      {/* ═══════════════════ MAKER DIALOG ═══════════════════ */}
      <Dialog open={mkrDialog} onOpenChange={setMkrDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

      {/* ═══════════════════ AUTHOR DIALOG ═══════════════════ */}
      <Dialog open={autDialog} onOpenChange={setAutDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <div>
              <label className={labelCls}>Avatar URL</label>
              <Input value={autAvatar} onChange={e => setAutAvatar(e.target.value)} placeholder="https://..." className="font-mono text-sm" />
              {autAvatar && (
                <div className="mt-2">
                  <img src={autAvatar} alt="Avatar preview" className="h-16 w-16 rounded-full object-cover border border-border" onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setAutDialog(false)}>Cancel</Button>
              <Button onClick={saveAut} disabled={autSaving || !autName || !autSlug} className="font-mono text-xs">
                {autSaving ? 'Saving...' : autEdit ? 'Update' : 'Create Author'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════ CATEGORY DIALOG ═══════════════════ */}
      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
