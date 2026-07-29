'use client'

import { useStore } from '@/store/useStore'
import { Badge } from '@/components/ui/badge'
import { Clock, ArrowRight } from 'lucide-react'

export function FromTheArchive() {
  const { articles, openArticle } = useStore()

  // Take 3 random-looking older articles (those that are not featured)
  const archive = articles
    .filter(a => !a.isFeatured && !a.isPinned)
    .slice(3, 6)

  if (archive.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-muted-foreground font-mono text-xs">&#9733;</span>
        <h2 className="font-serif text-2xl md:text-3xl font-bold">
          From the Archive
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>
      <p className="text-muted-foreground mb-8 text-sm">
        Stories worth revisiting from our growing collection
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {archive.map((article, i) => (
          <button
            key={article.id}
            onClick={() => openArticle(article)}
            className="group text-left relative rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-md"
          >
            <div className="flex">
              {/* Number accent */}
              <div className="shrink-0 w-16 flex items-center justify-center border-r border-border bg-secondary/50">
                <span className="font-serif text-3xl font-bold text-muted-foreground/30 group-hover:text-primary/40 transition-colors">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="flex-1 p-4 min-w-0">
                <Badge className="text-[10px] mb-2" style={{ backgroundColor: article.category.color + '15', color: article.category.color }}>
                  {article.category.name}
                </Badge>
                <h3 className="font-serif font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 font-mono flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {article.readTime} min read
                  <span className="text-border">·</span>
                  {new Date(article.publishedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
