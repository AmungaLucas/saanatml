'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, X, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function SearchModal() {
  const { isSearchOpen, toggleSearch, articles, categories, openArticle } = useStore()
  const [query, setQuery] = useState('')

  const filtered = query.length > 1
    ? articles.filter(a =>
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        a.tags.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : []

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleSearch()
      }
      if (e.key === 'Escape' && isSearchOpen) {
        toggleSearch()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen, toggleSearch])

  return (
    <Sheet open={isSearchOpen} onOpenChange={toggleSearch}>
      <SheetContent className="w-full sm:max-w-lg bg-background border-l border-border p-0">
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <SheetTitle className="font-serif text-2xl">Search Stories</SheetTitle>
        </SheetHeader>
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search articles, topics, tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12 text-lg bg-secondary/50 border-border font-sans"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {!query && (
            <div className="mt-6">
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Browse Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <Badge key={c.id} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1">
                    {c.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                {filtered.length} result{filtered.length > 1 ? 's' : ''}
              </p>
              <div className="space-y-2">
                {filtered.map(article => (
                  <button
                    key={article.id}
                    onClick={() => { openArticle(article); toggleSearch(); setQuery('') }}
                    className="w-full text-left p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                          {article.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <span style={{ color: article.category.color }}>{article.category.name}</span>
                          <span className="text-border">|</span>
                          <Clock className="h-3 w-3" />
                          <span>{article.readTime} min</span>
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.length > 1 && filtered.length === 0 && (
            <div className="mt-12 text-center">
              <p className="text-muted-foreground font-serif">No stories found for &ldquo;{query}&rdquo;</p>
              <p className="text-sm text-muted-foreground mt-2">Try different keywords or browse categories</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
