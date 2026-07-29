'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  FileText, Users, Tag, Calendar, Eye, MessageSquare, Star, Pin, Trash2,
  Plus, BarChart3, ArrowLeft, BookmarkCheck, BookOpen, Mail
} from 'lucide-react'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  views: number
  isFeatured: boolean
  isPinned: boolean
  category: { name: string; color: string }
  author: { name: string }
  commentCount: number
}

interface Stats {
  articles: number
  authors: number
  categories: number
  events: number
  comments: number
  makers: number
  subscribers: number
  totalViews: number
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'articles'>('overview')
  const [articles, setArticles] = useState<Article[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formExcerpt, setFormExcerpt] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formCoverImage, setFormCoverImage] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formAuthor, setFormAuthor] = useState('')
  const [formTags, setFormTags] = useState('')
  const [formReadTime, setFormReadTime] = useState('5')
  const [formSaving, setFormSaving] = useState(false)

  const [categories, setCategories] = useState<any[]>([])
  const [authors, setAuthors] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(() => {})
    fetch('/api/admin/articles').then(r => r.json()).then(setArticles).catch(() => {})
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {})
    fetch('/api/authors').then(r => r.json()).then(setAuthors).catch(() => {})
  }, [])

  const openCreateDialog = () => {
    setEditingArticle(null)
    setFormTitle('')
    setFormSlug('')
    setFormExcerpt('')
    setFormContent('')
    setFormCoverImage('')
    setFormCategory('')
    setFormAuthor('')
    setFormTags('')
    setFormReadTime('5')
    setIsDialogOpen(true)
  }

  const openEditDialog = (article: Article) => {
    setEditingArticle(article)
    setFormTitle(article.title)
    setFormSlug(article.slug)
    setFormExcerpt(article.excerpt)
    setFormContent('')
    setFormCoverImage(article.coverImage || '')
    setFormCategory(article.category?.name || '')
    setFormAuthor(article.author?.name || '')
    setFormTags('')
    setFormReadTime(String(5))
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formTitle || !formSlug) return
    setFormSaving(true)
    try {
      if (editingArticle) {
        const res = await fetch(`/api/admin/articles/${editingArticle.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: formTitle, slug: formSlug, excerpt: formExcerpt, coverImage: formCoverImage }),
        })
        if (res.ok) {
          const updated = await res.json()
          setArticles(prev => prev.map(a => a.id === updated.id ? { ...a, ...updated } : a))
        }
      } else {
        const catId = categories.find(c => c.name === formCategory)?.id || ''
        const authId = authors.find(a => a.name === formAuthor)?.id || ''
        if (!catId || !authId) { setFormSaving(false); return }
        const res = await fetch('/api/admin/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle, slug: formSlug, excerpt: formExcerpt,
            content: formContent, coverImage: formCoverImage,
            categoryId: catId, authorId: authId,
            readTime: parseInt(formReadTime) || 5, tags: formTags,
          }),
        })
        if (res.ok) {
          const newArticle = await res.json()
          setArticles(prev => [newArticle, ...prev])
        }
      }
      setIsDialogOpen(false)
    } catch {}
    setFormSaving(false)
  }

  const handleToggleFeatured = async (article: Article) => {
    const res = await fetch(`/api/admin/articles/${article.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !article.isFeatured }),
    })
    if (res.ok) {
      setArticles(prev => prev.map(a => a.id === article.id ? { ...a, isFeatured: !a.isFeatured } : a))
    }
  }

  const handleTogglePinned = async (article: Article) => {
    const res = await fetch(`/api/admin/articles/${article.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: !article.isPinned }),
    })
    if (res.ok) {
      setArticles(prev => prev.map(a => a.id === article.id ? { ...a, isPinned: !a.isPinned } : a))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article? This cannot be undone.')) return
    const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setArticles(prev => prev.filter(a => a.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-mono text-xs">Back to Site</span>
            </Link>
            <span className="text-border">|</span>
            <span className="font-serif font-bold text-lg">Admin Dashboard</span>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            Sanaa CMS
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 border-b border-border pb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-1.5" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'articles' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-1.5" /> Articles
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="animate-fadeIn">
            <h2 className="font-serif text-2xl font-bold mb-6">Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Articles', value: stats.articles, icon: FileText, color: 'text-primary' },
                { label: 'Authors', value: stats.authors, icon: Users, color: 'text-gold' },
                { label: 'Categories', value: stats.categories, icon: Tag, color: 'text-terracotta' },
                { label: 'Events', value: stats.events, icon: Calendar, color: 'text-forest' },
                { label: 'Comments', value: stats.comments, icon: MessageSquare, color: 'text-primary' },
                { label: 'Makers', value: stats.makers, icon: Star, color: 'text-gold' },
                { label: 'Subscribers', value: stats.subscribers, icon: Mail, color: 'text-terracotta' },
                { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-forest' },
              ].map(stat => (
                <div key={stat.label} className="p-5 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="font-serif text-2xl md:text-3xl font-bold">{stat.value}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="font-serif text-xl font-bold mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => { setActiveTab('articles'); openCreateDialog() }} className="gap-2">
                  <Plus className="h-4 w-4" /> New Article
                </Button>
                <Button variant="outline" className="gap-2" asChild>
                  <Link href="/makers"><BookmarkCheck className="h-4 w-4" /> Manage Makers</Link>
                </Button>
                <Button variant="outline" className="gap-2" asChild>
                  <Link href="/events"><Calendar className="h-4 w-4" /> Manage Events</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-bold">Articles ({articles.length})</h2>
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="h-4 w-4" /> New Article
              </Button>
            </div>

            {/* Articles Table */}
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary/50 border-b border-border">
                      <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Title</th>
                      <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hidden md:table-cell">Category</th>
                      <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Author</th>
                      <th className="text-right px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Views</th>
                      <th className="text-center px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="text-right px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map(article => (
                      <tr key={article.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-serif font-semibold text-sm line-clamp-1">{article.title}</p>
                          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                            {new Date(article.publishedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Badge className="text-[10px]" style={{ backgroundColor: article.category.color + '20', color: article.category.color }}>
                            {article.category.name}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                          {article.author.name}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm">{article.views}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleToggleFeatured(article)}
                              className={`p-1 rounded ${article.isFeatured ? 'text-gold' : 'text-muted-foreground/30 hover:text-gold/50'}`}
                              title="Featured"
                            >
                              <Star className="h-3.5 w-3.5" fill={article.isFeatured ? 'currentColor' : 'none'} />
                            </button>
                            <button
                              onClick={() => handleTogglePinned(article)}
                              className={`p-1 rounded ${article.isPinned ? 'text-primary' : 'text-muted-foreground/30 hover:text-primary/50'}`}
                              title="Pinned"
                            >
                              <Pin className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEditDialog(article)} className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Edit">
                              <FileText className="h-3.5 w-3.5" />
                            </button>
                            <a href={`/articles/${article.slug}`} target="_blank" className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="View">
                              <BookOpen className="h-3.5 w-3.5" />
                            </a>
                            <button onClick={() => handleDelete(article.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive" title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
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

      {/* Create/Edit Article Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editingArticle ? 'Edit Article' : 'New Article'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Title *</label>
              <Input value={formTitle} onChange={e => { setFormTitle(e.target.value); if (!editingArticle) setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')) }} placeholder="Article title" />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Slug *</label>
              <Input value={formSlug} onChange={e => setFormSlug(e.target.value)} placeholder="article-slug" className="font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Category</label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Author</label>
                <Select value={formAuthor} onValueChange={setFormAuthor}>
                  <SelectTrigger><SelectValue placeholder="Select author" /></SelectTrigger>
                  <SelectContent>
                    {authors.map(a => (
                      <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Excerpt</label>
              <Textarea value={formExcerpt} onChange={e => setFormExcerpt(e.target.value)} placeholder="Brief summary..." rows={2} />
            </div>
            {!editingArticle && (
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Content (Markdown)</label>
                <Textarea value={formContent} onChange={e => setFormContent(e.target.value)} placeholder="Write your article in Markdown..." rows={8} className="font-mono text-sm" />
              </div>
            )}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Cover Image URL</label>
              <Input value={formCoverImage} onChange={e => setFormCoverImage(e.target.value)} placeholder="https://images.unsplash.com/..." className="font-mono text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Tags</label>
                <Input value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="tag1, tag2, tag3" />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Read Time (min)</label>
                <Input type="number" value={formReadTime} onChange={e => setFormReadTime(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={formSaving || !formTitle || !formSlug} className="font-mono text-xs">
                {formSaving ? 'Saving...' : editingArticle ? 'Update' : 'Create Article'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
