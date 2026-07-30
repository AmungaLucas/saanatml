'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Bookmark, BookmarkCheck, User, Heart } from 'lucide-react'
import type { Article } from '@/store/useStore'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useActionToast } from './ActionToast'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'compact' | 'horizontal'
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const { openArticle, bookmarks, toggleBookmark, likes, toggleLike, isLiked } = useStore()
  const { showToast } = useActionToast()
  const isBookmarked = bookmarks.includes(article.id)
  const liked = isLiked(article.id)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Like animation state
  const [showLikePopup, setShowLikePopup] = useState(false)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleLike(article.id)
    if (!liked) {
      setShowLikePopup(true)
      setTimeout(() => setShowLikePopup(false), 800)
    }
  }

  if (variant === 'horizontal') {
    return (
      <Link
        href={`/articles/${article.slug}`}
        onClick={(e) => { e.preventDefault(); openArticle(article) }}
        className="w-full flex gap-4 text-left group"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 bg-secondary">
          <img
            ref={imgRef}
            src={article.coverImage}
            alt=""
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? '' : 'img-blur-up'}`}
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0 py-1">
          <Badge className="text-[10px] px-1.5 py-0 mb-1.5" style={{ backgroundColor: article.category.color + '20', color: article.category.color }}>
            {article.category.name}
          </Badge>
          <h3 className="font-serif font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2 font-mono">
            <a href={`/articles/${article.slug}`} onClick={(e) => e.stopPropagation()} className="hover:text-foreground">{article.author.name}</a>
            <span className="text-border">·</span>
            <span>{new Date(article.publishedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </p>
        </div>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link
        href={`/articles/${article.slug}`}
        onClick={(e) => { e.preventDefault(); openArticle(article) }}
        className="w-full text-left p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
      >
        <div className="flex items-start gap-3">
          <span className="font-mono text-xs text-muted-foreground mt-0.5">
            {article.category.name}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-serif font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
              {article.title}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {article.readTime} min read
            </p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <article className="group cursor-pointer hover-card rounded-xl" onClick={() => openArticle(article)}>
      <div className="relative rounded-xl overflow-hidden mb-3 aspect-[16/10] bg-secondary">
        {/* Blur-up image */}
        <img
          ref={imgRef}
          src={article.coverImage}
          alt={article.title}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imgLoaded ? 'img-blur-up loaded' : 'img-blur-up'}`}
          loading="lazy"
        />

        {/* Error fallback */}
        {imgError && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <span className="font-serif text-muted-foreground text-sm">{article.category.name}</span>
          </div>
        )}

        {/* Category badge */}
        <Badge
          className="absolute top-3 left-3 text-xs transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: article.category.color, color: '#fff' }}
        >
          {article.category.name}
        </Badge>

        {/* Action buttons overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Like button */}
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8"
            onClick={handleLike}
          >
            <Heart className={`h-3.5 w-3.5 transition-all ${liked ? 'fill-red-400 text-red-400 scale-110' : ''}`} />
          </Button>

          {/* Bookmark button */}
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8"
            onClick={(e) => { e.stopPropagation(); toggleBookmark(article.id); showToast({ type: isBookmarked ? 'unbookmark' : 'bookmark', message: isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks' }) }}
          >
            {isBookmarked ? <BookmarkCheck className="h-3.5 w-3.5 fill-gold text-gold" /> : <Bookmark className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Like popup animation */}
        <AnimatePresence>
          {showLikePopup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="absolute bottom-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-mono"
            >
              <Heart className="h-3 w-3 inline mr-1" /> Liked!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Read time badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 text-white text-[10px] font-mono px-2 py-1 rounded-full backdrop-blur-sm">
          <Clock className="h-2.5 w-2.5" />
          {article.readTime} min
        </div>
      </div>

      <Link href={`/articles/${article.slug}`} onClick={(e) => e.stopPropagation()} className="block">
        <h3 className="font-serif font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
          {article.title}
        </h3>
      </Link>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
        {article.excerpt}
      </p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <a
            href={`/authors/${article.author.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <User className="h-3 w-3" />
            {article.author.name}
          </a>
          <span className="text-border">·</span>
          <span>{new Date(article.publishedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        {(likes[article.id] || 0) > 0 && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Heart className="h-3 w-3 text-red-400/60" />
            {likes[article.id]}
          </span>
        )}
      </div>
    </article>
  )
}
