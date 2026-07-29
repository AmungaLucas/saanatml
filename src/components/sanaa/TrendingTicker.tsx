'use client'

import { useStore } from '@/store/useStore'

export function TrendingTicker() {
  const { articles } = useStore()

  const trending = articles
    .filter(a => a.isPinned || a.isFeatured)
    .slice(0, 5)

  if (trending.length === 0) return null

  const items = [...trending, ...trending]

  return (
    <div className="bg-primary text-primary-foreground overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center">
        <div className="shrink-0 px-4 py-2 bg-primary-foreground/10 font-mono text-xs font-semibold uppercase tracking-wider border-r border-primary-foreground/20">
          Trending
        </div>
        <div className="overflow-hidden flex-1">
          <div className="animate-ticker flex whitespace-nowrap">
            {items.map((article, i) => (
              <button
                key={`${article.id}-${i}`}
                onClick={() => useStore.getState().openArticle(article)}
                className="px-4 md:px-6 py-2 hover:bg-primary-foreground/10 transition-colors flex items-center gap-2 text-sm"
              >
                <span className="font-serif font-medium">{article.title}</span>
                <span className="text-primary-foreground/40">•</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
