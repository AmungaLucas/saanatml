'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Bookmark, User } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { Article } from '@/store/useStore'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'compact' | 'horizontal'
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const { openArticle } = useStore()

  if (variant === 'horizontal') {
    return (
      <button
        onClick={() => openArticle(article)}
        className="w-full flex gap-4 text-left group"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 bg-secondary">
          <img src={article.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="flex-1 min-w-0 py-1">
          <Badge className="text-[10px] px-1.5 py-0 mb-1.5" style={{ backgroundColor: article.category.color + '20', color: article.category.color }}>
            {article.category.name}
          </Badge>
          <h3 className="font-serif font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2 font-mono">
            <span>{article.author.name}</span>
            <span className="text-border">·</span>
            <span>{new Date(article.publishedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </p>
        </div>
      </button>
    )
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={() => openArticle(article)}
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
      </button>
    )
  }

  return (
    <article className="group cursor-pointer" onClick={() => openArticle(article)}>
      <div className="relative rounded-xl overflow-hidden mb-3 aspect-[16/10] bg-secondary">
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <Badge
          className="absolute top-3 left-3 text-xs"
          style={{ backgroundColor: article.category.color, color: '#fff' }}
        >
          {article.category.name}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => { e.stopPropagation() }}
        >
          <Bookmark className="h-3.5 w-3.5" />
        </Button>
      </div>
      <h3 className="font-serif font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
        {article.title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
        {article.excerpt}
      </p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground hover:text-primary transition-colors">
          {article.author.name}
        </span>
        <span className="text-border">·</span>
        <span>{new Date(article.publishedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {article.readTime}
        </span>
      </div>
    </article>
  )
}
