'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ArticleCard } from '@/components/sanaa/ArticleCard'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface CategoryContentProps {
  category: { id: string; name: string; slug: string; description: string; color: string }
  articles: any[]
  events: any[]
  allCategories: Array<{ id: string; name: string; slug: string; description: string; color: string }>
}

export function CategoryContent({ category, articles, events, allCategories }: CategoryContentProps) {
  const [showCount, setShowCount] = useState(6)
  const visible = articles.slice(0, showCount)

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span style={{ color: category.color }}>{category.name}</span>
      </nav>

      {/* Category Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color }} />
          <Badge style={{ backgroundColor: category.color + '15', color: category.color }} className="text-xs">
            {category.name}
          </Badge>
        </div>
        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-3">{category.name}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{category.description}</p>
        <p className="font-mono text-sm text-muted-foreground mt-2">
          {articles.length} stor{articles.length === 1 ? 'y' : 'ies'}
        </p>
      </div>

      {/* Articles */}
      <section className="mb-12">
        {visible.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="font-serif text-lg text-muted-foreground">No stories in this category yet</p>
            <Link href="/" className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-mono hover:underline">
              <ArrowLeft className="h-3 w-3" /> Back to all stories
            </Link>
          </div>
        )}

        {visible.length < articles.length && (
          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => setShowCount(p => p + 6)} className="font-mono text-xs">
              Load More
            </Button>
          </div>
        )}
      </section>

      {/* Related Events */}
      {events.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-serif text-xl font-bold">Upcoming Events</h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.slice(0, 3).map(event => (
              <div key={event.id} className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors">
                <div className="text-center shrink-0">
                  <div className="font-mono text-xs text-primary uppercase">
                    {new Date(event.date).toLocaleDateString('en-KE', { month: 'short' })}
                  </div>
                  <div className="font-serif text-2xl font-bold">{new Date(event.date).getDate()}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-semibold text-sm line-clamp-1">{event.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{event.venue}, {event.city}</p>
                  <Badge variant="outline" className="mt-2 text-[10px]">{event.category}</Badge>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Other Categories */}
      <section className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-serif text-xl font-bold">Explore Other Categories</h2>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="flex flex-wrap gap-2">
          {allCategories
            .filter(c => c.slug !== category.slug)
            .map(cat => (
              <Link key={cat.id} href={`/category/${cat.slug}`}>
                <Button variant="outline" size="sm" className="font-mono text-xs">{cat.name}</Button>
              </Link>
            ))}
        </div>
      </section>
    </main>
  )
}
