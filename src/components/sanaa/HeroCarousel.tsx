'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
}

export function HeroCarousel() {
  const { featuredArticles, openArticle } = useStore()
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const featured = featuredArticles.length > 0 ? featuredArticles : useStore.getState().articles.slice(0, 3)

  const next = useCallback(() => {
    setDirection(1)
    setCurrent(c => (c + 1) % featured.length)
  }, [featured.length])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent(c => (c - 1 + featured.length) % featured.length)
  }, [featured.length])

  useEffect(() => {
    if (isPaused || featured.length <= 1) return
    const timer = setInterval(next, 7000)
    return () => clearInterval(timer)
  }, [next, isPaused, featured.length])

  if (featured.length === 0) return null

  const article = featured[current]

  return (
    <section className="relative">
      <div
        className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative rounded-2xl overflow-hidden group cursor-pointer" style={{ aspectRatio: '16/9' }}
          onClick={() => openArticle(article)}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0"
            >
              {/* Background Image with Ken Burns */}
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover animate-kenBurns"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${current}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12"
              onClick={(e) => { e.stopPropagation(); openArticle(article) }}
            >
              <div className="max-w-2xl">
                <Badge
                  className="mb-3 hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: article.category.color, color: '#fff' }}
                >
                  {article.category.name}
                </Badge>
                <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 hover:underline decoration-2 underline-offset-4">
                  {article.title}
                </h2>
                <p className="text-white/80 text-sm md:text-base line-clamp-2 mb-4 max-w-xl">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-4 text-white/60 text-xs font-mono">
                  <a
                    href={`/authors/${article.author.slug}`}
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); window.location.href = `/authors/${article.author.slug}` }}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <User className="h-3 w-3" />
                    {article.author.name}
                  </a>
                  <span>{new Date(article.publishedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readTime} min
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Auto-progress bar */}
          {!isPaused && (
            <motion.div
              key={current}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="h-full bg-gold"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 7, ease: 'linear' }}
              />
            </motion.div>
          )}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
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
