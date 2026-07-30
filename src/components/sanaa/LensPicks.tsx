'use client'

import { useStore } from '@/store/useStore'
import { Badge } from '@/components/ui/badge'
import { Clock, User, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function LensPicks() {
  const { featuredArticles, articles, openArticle } = useStore()

  const picks = featuredArticles.length >= 3
    ? featuredArticles.slice(0, 3)
    : articles.slice(0, 3)

  if (picks.length < 3) return null

  const featured = picks[0]
  const sidePicks = picks.slice(1, 3)

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="h-5 w-5 text-gold" />
        <h2 className="font-serif text-2xl md:text-3xl font-bold">
          The Lens Picks
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>
      <p className="text-muted-foreground mb-8 text-sm">
        Editor&rsquo;s selection of stories worth your time
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Pick */}
        <div className="lg:col-span-2">
          <button
            onClick={() => openArticle(featured)}
            className="w-full text-left group"
          >
            <div className="relative rounded-xl overflow-hidden aspect-[16/10] border border-primary/10">
              <img
                src={featured.coverImage}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute top-3 left-3">
                <Badge className="bg-gold text-white text-[10px] font-mono gap-1">
                  <Sparkles className="h-3 w-3" /> Editor&rsquo;s Pick
                </Badge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <Badge
                  className="mb-2 text-xs"
                  style={{ backgroundColor: featured.category.color, color: '#fff' }}
                >
                  {featured.category.name}
                </Badge>
                <h3 className="font-serif font-bold text-xl md:text-2xl text-white leading-tight mb-2 group-hover:underline decoration-2 underline-offset-4">
                  {featured.title}
                </h3>
                <p className="text-white/70 text-sm line-clamp-2 mb-3">{featured.excerpt}</p>
                <div className="flex items-center gap-3 text-white/50 text-xs font-mono">
                  <a href={`/authors/${featured.author.slug}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 hover:text-white/80 transition-colors">
                    <User className="h-3 w-3" />
                    {featured.author.name}
                  </a>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {featured.readTime} min
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Side Picks */}
        <div className="space-y-4">
          {sidePicks.map((pick, i) => (
            <button
              key={pick.id}
              onClick={() => openArticle(pick)}
              className="w-full text-left group"
            >
              <div className="relative rounded-xl overflow-hidden border border-primary/10 bg-card hover:border-primary/30 transition-colors">
                <div className="aspect-[16/7]">
                  <img
                    src={pick.coverImage}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <div className="p-4 -mt-6 relative">
                  <Badge
                    className="mb-2 text-[10px]"
                    style={{ backgroundColor: pick.category.color, color: '#fff' }}
                  >
                    {pick.category.name}
                  </Badge>
                  <h3 className="font-serif font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {pick.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 font-mono flex items-center gap-2">
                    <User className="h-3 w-3" /> <a href={`/authors/${pick.author.slug}`} onClick={(e) => e.stopPropagation()} className="hover:text-foreground transition-colors">{pick.author.name}</a>
                    <span className="text-border">·</span>
                    <Clock className="h-3 w-3" /> {pick.readTime} min
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
