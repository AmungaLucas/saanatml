'use client'

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { ArticleCard } from './ArticleCard'
import { Sidebar } from './Sidebar'
import { Button } from '@/components/ui/button'

export function StoryGrid() {
  const { articles, categories, activeCategory, setActiveCategory } = useStore()

  const filterOptions = [
    { label: 'All', slug: 'all' },
    ...categories.map(c => ({ label: c.name, slug: c.slug })),
  ]

  const filtered = activeCategory === 'all'
    ? articles
    : articles.filter(a => a.category.slug === activeCategory)

  const [showCount, setShowCount] = useState(6)

  const visible = filtered.slice(0, showCount)
  const hasMore = filtered.length > showCount

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl md:text-3xl font-bold">Latest Stories</h2>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
        {filterOptions.map(opt => (
          <Button
            key={opt.slug}
            variant={activeCategory === opt.slug ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setActiveCategory(opt.slug); setShowCount(6) }}
            className={`shrink-0 font-mono text-xs ${
              activeCategory === opt.slug
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-secondary'
            }`}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {visible.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visible.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-serif text-lg text-muted-foreground">No stories in this category yet</p>
            </div>
          )}

          {hasMore && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={() => setShowCount(prev => prev + 6)}
                className="font-mono text-xs"
              >
                Load More Stories
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <Sidebar />
        </div>
      </div>
    </section>
  )
}
