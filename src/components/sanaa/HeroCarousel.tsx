'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, ChevronLeft, ChevronRight, User } from 'lucide-react'

export function HeroCarousel() {
  const { featuredArticles, openArticle } = useStore()
  const [current, setCurrent] = useState(0)

  const featured = featuredArticles.length > 0 ? featuredArticles : useStore.getState().articles.slice(0, 3)

  const next = useCallback(() => setCurrent(c => (c + 1) % featured.length), [featured.length])
  const prev = useCallback(() => setCurrent(c => (c - 1 + featured.length) % featured.length), [featured.length])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  if (featured.length === 0) return null

  const article = featured[current]

  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="relative rounded-2xl overflow-hidden group" style={{ aspectRatio: '16/9' }}>
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12">
            <div className="max-w-2xl">
              <Badge
                className="mb-3 hover:opacity-80 transition-opacity"
                style={{ backgroundColor: article.category.color, color: '#fff' }}
              >
                {article.category.name}
              </Badge>
              <h2
                className="font-serif text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 cursor-pointer hover:underline decoration-2 underline-offset-4"
                onClick={() => openArticle(article)}
              >
                {article.title}
              </h2>
              <p className="text-white/80 text-sm md:text-base line-clamp-2 mb-4 max-w-xl">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-4 text-white/60 text-xs font-mono">
                <span className="flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  {article.author.name}
                </span>
                <span>{new Date(article.publishedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.readTime} min
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <Button
            variant="ghost"
            size="icon"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-primary' : 'w-1.5 bg-border hover:bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
