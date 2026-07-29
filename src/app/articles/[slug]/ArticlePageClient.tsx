'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArticleCard } from '@/components/sanaa/ArticleCard'
import { ReadingProgress } from '@/components/sanaa/ReadingProgress'
import { NewsletterCTA } from '@/components/sanaa/NewsletterCTA'
import {
  Clock, Eye, Bookmark, BookmarkCheck, ChevronRight,
  User, Calendar, Send,
  MessageSquare, Twitter, Facebook, Linkedin, Copy, Check,
  ArrowLeft
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import { useStore, type Comment } from '@/store/useStore'

interface ArticlePageProps {
  article: any
  related: any[]
}

export function ArticlePageClient({ article, related }: ArticlePageProps) {
  const { bookmarks, toggleBookmark } = useStore()
  const [comments, setComments] = useState<Comment[]>(article.comments || [])
  const [commentText, setCommentText] = useState('')
  const [commentName, setCommentName] = useState('')
  const [copied, setCopied] = useState(false)

  const isBookmarked = bookmarks.includes(article.id)
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/articles/${article.slug}` : ''

  const handleComment = async () => {
    if (!commentText.trim() || !commentName.trim()) return
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id, author: commentName, content: commentText }),
      })
      const newComment = await res.json()
      setComments(prev => [newComment, ...prev])
      setCommentText('')
    } catch {}
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <>
      <ReadingProgress />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 animate-fadeIn">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/category/${article.category.slug}`} className="hover:text-foreground" style={{ color: article.category.color }}>
            {article.category.name}
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <Badge className="mb-4" style={{ backgroundColor: article.category.color + '15', color: article.category.color }}>
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
            <Link href={`/authors/${article.author.slug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{article.author.name}</p>
                <p className="text-xs text-muted-foreground">{article.author.role}</p>
              </div>
            </Link>
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
            </div>
          </div>
        </header>

        {/* Action Bar */}
        <div className="flex items-center gap-2 mb-8 pb-6 border-b border-border">
          <Button
            variant={isBookmarked ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleBookmark(article.id)}
            className="gap-1.5 text-xs font-mono"
          >
            {isBookmarked ? <BookmarkCheck className="h-3 w-3 fill-gold text-gold" /> : <Bookmark className="h-3 w-3" />}
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-mono" onClick={handleCopyLink}>
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer">
              <Twitter className="h-3 w-3" />
            </a>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
              <Facebook className="h-3 w-3" />
            </a>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-3 w-3" />
            </a>
          </Button>
        </div>

        {/* Cover Image */}
        <div className="rounded-xl overflow-hidden mb-10 aspect-[16/9]">
          <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
        </div>

        {/* Article Body */}
        <div className="prose-article max-w-3xl">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        {/* Author Bio Card */}
        <div className="max-w-3xl mt-10 p-6 rounded-xl border border-border bg-card">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-wider text-primary mb-1">Written by</p>
              <Link href={`/authors/${article.author.slug}`} className="font-serif font-bold text-lg hover:text-primary transition-colors">
                {article.author.name}
              </Link>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-3">{article.author.bio}</p>
              <Link href={`/authors/${article.author.slug}`} className="inline-block mt-3 text-sm text-primary font-mono hover:underline">
                Read more by {article.author.name} &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Tags */}
        {article.tags && (
          <div className="max-w-3xl flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-border">
            <span className="text-sm font-mono text-muted-foreground">Tags:</span>
            {article.tags.split(',').map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">{tag.trim()}</Badge>
            ))}
          </div>
        )}

        {/* Newsletter Inline */}
        <div className="max-w-3xl mt-12">
          <NewsletterCTA variant="inline" />
        </div>

        {/* Comments */}
        <div className="max-w-3xl mt-12">
          <h3 className="font-serif font-bold text-xl mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({comments.length})
          </h3>

          <div className="space-y-3 mb-8 p-4 rounded-xl border border-border bg-card">
            <Input placeholder="Your name" value={commentName} onChange={e => setCommentName(e.target.value)} className="h-9 text-sm" />
            <Textarea placeholder="Share your thoughts..." value={commentText} onChange={e => setCommentText(e.target.value)} className="min-h-[80px] text-sm" />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleComment} disabled={!commentText.trim() || !commentName.trim()} className="gap-1.5 text-xs font-mono">
                <Send className="h-3 w-3" /> Post Comment
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{comment.author}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{comment.content}</p>
              </div>
            ))}
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
              {related.map(r => (
                <ArticleCard key={r.id} article={r} />
              ))}
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to all stories
          </Link>
        </div>
      </div>
    </>
  )
}
