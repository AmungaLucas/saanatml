'use client'

import { useState, useEffect, useMemo } from 'react'
import { useStore, type Comment } from '@/store/useStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArticleCard } from './ArticleCard'
import { ReadingProgress } from './ReadingProgress'
import {
  X, Clock, Eye, Share2, Bookmark, BookmarkCheck, ChevronRight,
  User, Calendar, ArrowLeft, Send, Heart,
  MessageSquare, Twitter, Facebook, Linkedin, Copy, Check,
  List, BookOpen
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useActionToast } from './ActionToast'

export function ArticleModal() {
  const {
    selectedArticle: article, isArticleOpen, closeArticle,
    bookmarks, toggleBookmark,
    likes, toggleLike, isLiked,
    addToHistory, updateHistoryProgress,
  } = useStore()
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentName, setCommentName] = useState('')
  const [related, setRelated] = useState<any[]>([])
  const [copied, setCopied] = useState(false)
  const [activeHeading, setActiveHeading] = useState('')

  useEffect(() => {
    if (isArticleOpen && article) {
      fetch(`/api/articles/${article.slug}`)
        .then(r => r.json())
        .then(data => {
          setComments(data.article?.comments || [])
          setRelated(data.related || [])
        })
        .catch(() => {})
      // Track in reading history
      addToHistory(article)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isArticleOpen, article])

  // Extract headings for TOC
  const headings = useMemo(() => {
    if (!article) return []
    const lines = article.content.split('\n')
    return lines
      .filter(l => l.startsWith('##') || l.startsWith('###'))
      .map(l => {
        const level = l.startsWith('###') ? 3 : 2
        const text = l.replace(/^#{2,3}\s/, '').trim()
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
        return { level, text, id }
      })
      .filter(h => h.text.length > 0)
  }, [article])

  // Scroll spy for active heading
  useEffect(() => {
    if (!isArticleOpen) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0px -70% 0px' }
    )

    headings.forEach(h => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [isArticleOpen, headings])

  // Track reading progress
  useEffect(() => {
    if (!isArticleOpen || !article) return
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const progress = Math.min(Math.round((scrollTop / (scrollHeight - window.innerHeight)) * 100), 100)
      updateHistoryProgress(article.id, progress)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isArticleOpen, article])

  const handleComment = async () => {
    if (!article || !commentText.trim() || !commentName.trim()) return
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id, author: commentName, content: commentText }),
      })
      const newComment = await res.json()
      setComments(prev => [newComment, ...prev])
      setCommentText('')
      showToast({ type: 'comment', message: 'Comment posted' })
    } catch {}
  }

  const handleCopyLink = async () => {
    if (!article) return
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/articles/${article.slug}`)
      setCopied(true)
      showToast({ type: 'copy', message: 'Link copied' })
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const shareUrl = article ? `${typeof window !== 'undefined' ? window.location.origin : ''}/articles/${article.slug}` : ''

  if (!isArticleOpen || !article) return null

  const { showToast } = useActionToast()

  const isBookmarked = bookmarks.includes(article.id)
  const liked = isLiked(article.id)
  const likeCount = likes[article.id] || 0

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-y-auto">
      <ReadingProgress />

      {/* Top bar */}
      <div className="sticky top-0 z-10 glass">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
          <a href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-mono text-xs">Back</span>
          </a>
          <div className="flex items-center gap-1">
            {/* Like */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 transition-colors ${liked ? 'text-red-500 hover:text-red-600' : ''}`}
              onClick={() => toggleLike(article.id)}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            </Button>
            {/* Bookmark */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => toggleBookmark(article.id)}
            >
              {isBookmarked ? <BookmarkCheck className="h-4 w-4 fill-gold text-gold" /> : <Bookmark className="h-4 w-4" />}
            </Button>
            {/* Copy Link */}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyLink}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            {/* Share */}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share2 className="h-4 w-4" />
            </Button>
            <button onClick={closeArticle} className="p-2 hover:bg-secondary rounded-md transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-6">
          <Link href="/" onClick={closeArticle} className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/category/${article.category.slug}`} onClick={closeArticle} className="hover:text-foreground transition-colors" style={{ color: article.category.color }}>
            {article.category.name}
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <Badge
            className="mb-4"
            style={{ backgroundColor: article.category.color + '15', color: article.category.color }}
          >
            {article.category.name}
          </Badge>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
            {article.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            {article.excerpt}
          </p>

          {/* Author + Meta */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-border">
            <a href={`/authors/${article.author.slug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{article.author.name}</p>
                <p className="text-xs text-muted-foreground">{article.author.role}</p>
              </div>
            </a>
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono ml-auto">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(article.publishedAt).toLocaleDateString('en-KE', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.readTime} min
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {article.views}
              </span>
              {likeCount > 0 && (
                <span className="flex items-center gap-1 text-red-500">
                  <Heart className="h-3 w-3" />
                  {likeCount}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <div className="rounded-xl overflow-hidden mb-10 aspect-[16/9] bg-secondary">
          <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
        </div>

        {/* Body + TOC Layout */}
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0 prose-article max-w-3xl">
            <ReactMarkdown
              components={{
                h2: ({ children, ...props }) => {
                  const text = String(children).replace(/[^a-z0-9]/gi, '-').toLowerCase()
                  const id = text.replace(/-+$/, '')
                  return <h2 id={id} {...props}>{children}</h2>
                },
                h3: ({ children, ...props }) => {
                  const text = String(children).replace(/[^a-z0-9]/gi, '-').toLowerCase()
                  const id = text.replace(/-+$/, '')
                  return <h3 id={id} {...props}>{children}</h3>
                },
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>

          {/* Table of Contents Sidebar (desktop) */}
          {headings.length > 2 && (
            <aside className="hidden xl:block w-56 shrink-0">
              <div className="sticky top-20">
                <div className="flex items-center gap-2 mb-4">
                  <List className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Contents</h4>
                </div>
                <nav className="space-y-1 border-l border-border pl-3">
                  {headings.map(h => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      onClick={(e) => {
                        e.preventDefault()
                        document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                      className={`block text-xs transition-colors py-1 ${
                        h.level === 3 ? 'pl-3' : ''
                      } ${
                        activeHeading === h.id
                          ? 'text-primary font-semibold border-l-2 border-primary -ml-[13px] pl-[11px]'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>

                {/* Reactions */}
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Reactions</p>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleLike(article.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-colors ${
                        liked
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : 'bg-secondary text-muted-foreground hover:text-foreground border border-transparent'
                      }`}
                    >
                      <Heart className={`h-3 w-3 ${liked ? 'fill-current' : ''}`} />
                      {likeCount || 0}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleBookmark(article.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-colors ${
                        isBookmarked
                          ? 'bg-gold/10 text-gold border border-gold/20'
                          : 'bg-secondary text-muted-foreground hover:text-foreground border border-transparent'
                      }`}
                    >
                      <BookmarkCheck className={`h-3 w-3 ${isBookmarked ? 'fill-current' : ''}`} />
                      Save
                    </motion.button>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* Author Bio Card */}
        <div className="max-w-3xl mt-10 p-6 rounded-xl border border-border bg-card hover-card">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-wider text-primary mb-1">Written by</p>
              <h3 className="font-serif font-bold text-lg">{article.author.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-3">{article.author.bio}</p>
              <a href={`/authors/${article.author.slug}`} className="inline-block mt-3 text-sm text-primary font-mono hover:underline">
                Read more by {article.author.name} &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* Tags */}
        {article.tags && (
          <div className="max-w-3xl flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-border">
            <span className="text-sm font-mono text-muted-foreground">Tags:</span>
            {article.tags.split(',').map(tag => (
              <Badge key={tag} variant="outline" className="text-xs hover:bg-secondary transition-colors cursor-pointer">{tag.trim()}</Badge>
            ))}
          </div>
        )}

        {/* Share */}
        <div className="max-w-3xl flex flex-wrap items-center gap-3 mt-6">
          <span className="text-sm font-mono text-muted-foreground">Share:</span>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer">
              <Twitter className="h-3 w-3" /> Twitter
            </a>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
              <Facebook className="h-3 w-3" /> Facebook
            </a>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-3 w-3" /> LinkedIn
            </a>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleCopyLink}>
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy Link'}
          </Button>
        </div>

        {/* Comments */}
        <div className="max-w-3xl mt-12">
          <h3 className="font-serif font-bold text-xl mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({comments.length})
          </h3>

          {/* Add Comment */}
          <div className="space-y-3 mb-8 p-4 rounded-xl border border-border bg-card">
            <Input
              placeholder="Your name"
              value={commentName}
              onChange={e => setCommentName(e.target.value)}
              className="h-9 text-sm"
            />
            <Textarea
              placeholder="Share your thoughts..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="min-h-[80px] text-sm"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleComment}
                disabled={!commentText.trim() || !commentName.trim()}
                className="gap-1.5 text-xs font-mono"
              >
                <Send className="h-3 w-3" /> Post Comment
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            <AnimatePresence>
              {comments.map(comment => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl border border-border bg-card"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{comment.author}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString('en-KE', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{comment.content}</p>
                </motion.div>
              ))}
            </AnimatePresence>
            {comments.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">
                No comments yet. Be the first to share your thoughts.
              </p>
            )}
          </div>
        </div>

        {/* Related Stories */}
        {related.length > 0 && (
          <div className="mt-12">
            <h3 className="font-serif font-bold text-xl mb-6">You Might Also Like</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {related.slice(0, 4).map(r => (
                <ArticleCard key={r.id} article={r} />
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
