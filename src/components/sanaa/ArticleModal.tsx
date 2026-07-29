'use client'

import { useState, useEffect } from 'react'
import { useStore, type Comment } from '@/store/useStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArticleCard } from './ArticleCard'
import {
  X, Clock, Eye, Share2, Bookmark, ChevronRight,
  User, Calendar, ArrowLeft, Send, ThumbsUp,
  MessageSquare, Twitter, Facebook
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export function ArticleModal() {
  const { selectedArticle: article, isArticleOpen, closeArticle } = useStore()
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentName, setCommentName] = useState('')
  const [related, setRelated] = useState<any[]>([])

  useEffect(() => {
    if (isArticleOpen && article) {
      // Fetch article details + related
      fetch(`/api/articles/${article.slug}`)
        .then(r => r.json())
        .then(data => {
          setComments(data.article?.comments || [])
          setRelated(data.related || [])
        })
        .catch(() => {})
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
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
    } catch {}
  }

  if (!isArticleOpen || !article) return null

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
          <button onClick={closeArticle} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-mono text-xs">Back</span>
          </button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bookmark className="h-4 w-4" />
            </Button>
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
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-6">
          <button onClick={closeArticle} className="hover:text-foreground">Home</button>
          <ChevronRight className="h-3 w-3" />
          <span style={{ color: article.category.color }}>{article.category.name}</span>
        </div>

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
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{article.author.name}</p>
                <p className="text-xs text-muted-foreground">{article.author.role}</p>
              </div>
            </div>
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

        {/* Cover Image */}
        <div className="rounded-xl overflow-hidden mb-10 aspect-[16/9]">
          <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
        </div>

        {/* Article Body */}
        <div className="prose-article max-w-3xl">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        {/* Tags */}
        {article.tags && (
          <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-border">
            <span className="text-sm font-mono text-muted-foreground">Tags:</span>
            {article.tags.split(',').map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">{tag.trim()}</Badge>
            ))}
          </div>
        )}

        {/* Share */}
        <div className="flex items-center gap-3 mt-6">
          <span className="text-sm font-mono text-muted-foreground">Share:</span>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Twitter className="h-3 w-3" /> Twitter
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Facebook className="h-3 w-3" /> Facebook
          </Button>
        </div>

        {/* Newsletter Inline */}
        <div className="mt-12 p-6 rounded-xl bg-primary/5 border border-primary/20">
          <h3 className="font-serif font-bold text-lg mb-2">Enjoyed this story?</h3>
          <p className="text-sm text-muted-foreground mb-4">Get more like this delivered to your inbox every week.</p>
          <div className="flex gap-2">
            <Input placeholder="Your name (optional)" className="max-w-[200px] h-9 text-sm" />
            <Input placeholder="Your email address" className="flex-1 h-9 text-sm" />
            <Button size="sm" className="bg-primary text-primary-foreground h-9 px-4 text-xs font-mono">
              Subscribe
            </Button>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-12">
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
            {comments.map(comment => (
              <div key={comment.id} className="p-4 rounded-xl border border-border bg-card">
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
            <h3 className="font-serif font-bold text-xl mb-6">Related Stories</h3>
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
