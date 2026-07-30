'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, X, Clock, ArrowRight, TrendingUp, History } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const RECENT_SEARCHES_KEY = 'sanaa-recent-searches'
const MAX_RECENT = 8

function loadRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveRecentSearches(searches: string[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches))
  } catch {}
}

export function SearchModal() {
  const { isSearchOpen, toggleSearch, articles, categories, openArticle } = useStore()
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query.length > 1
    ? articles.filter(a =>
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        a.tags.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : []

  // Load recent searches on mount
  useEffect(() => {
    if (isSearchOpen) {
      setRecentSearches(loadRecentSearches())
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isSearchOpen])

  const addRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    setRecentSearches(prev => {
      const updated = [trimmed, ...prev.filter(s => s !== trimmed)].slice(0, MAX_RECENT)
      saveRecentSearches(updated)
      return updated
    })
  }, [])

  const clearRecentSearches = () => {
    setRecentSearches([])
    saveRecentSearches([])
  }

  const handleSelect = (article: typeof articles[0]) => {
    addRecentSearch(query)
    openArticle(article)
    toggleSearch()
    setQuery('')
    setSelectedIdx(-1)
  }

  const handleRecentClick = (term: string) => {
    setQuery(term)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleSearch()
      }
      if (e.key === 'Escape' && isSearchOpen) {
        toggleSearch()
      }
      if (!isSearchOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIdx(prev => Math.min(prev + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIdx(prev => Math.max(prev - 1, -1))
      } else if (e.key === 'Enter' && selectedIdx >= 0 && filtered[selectedIdx]) {
        e.preventDefault()
        handleSelect(filtered[selectedIdx])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen, toggleSearch, filtered, selectedIdx])

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIdx(-1)
  }, [query])

  // Trending topics from popular tags
  const allTags = articles.flatMap(a => a.tags.split(',').map(t => t.trim()).filter(Boolean))
  const trendingTopics = [...new Set(allTags)].slice(0, 6)

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
              ref={inputRef}
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

          {/* Keyboard hint */}
          <div className="flex items-center gap-2 mt-2">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono text-muted-foreground border border-border">
              ↑↓
            </kbd>
            <span className="text-[10px] font-mono text-muted-foreground">Navigate</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono text-muted-foreground border border-border">
              ↵
            </kbd>
            <span className="text-[10px] font-mono text-muted-foreground">Open</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono text-muted-foreground border border-border">
              esc
            </kbd>
            <span className="text-[10px] font-mono text-muted-foreground">Close</span>
          </div>

          {/* Recent searches */}
          {!query && recentSearches.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <History className="h-3 w-3" /> Recent
                </p>
                <button onClick={clearRecentSearches} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map(term => (
                  <button
                    key={term}
                    onClick={() => handleRecentClick(term)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-sm text-foreground/70"
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {term}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Topics */}
          {!query && (
            <div className="mt-6">
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" /> Trending Topics
              </p>
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map(topic => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1"
                    onClick={() => handleRecentClick(topic)}
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Browse Categories</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <Badge key={c.id} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1">
                      {c.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          <AnimatePresence mode="wait">
            {filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-6"
              >
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                  {filtered.length} result{filtered.length > 1 ? 's' : ''}
                </p>
                <div className="space-y-1">
                  {filtered.map((article, idx) => (
                    <button
                      key={article.id}
                      onClick={() => handleSelect(article)}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className={`w-full text-left p-3 rounded-lg transition-colors group ${
                        idx === selectedIdx ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className={`font-serif font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1 ${
                            idx === selectedIdx ? 'text-primary' : ''
                          }`}>
                            {article.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            <span style={{ color: article.category.color }}>{article.category.name}</span>
                            <span className="text-border">|</span>
                            <Clock className="h-3 w-3" />
                            <span>{article.readTime} min</span>
                          </p>
                        </div>
                        <ArrowRight className={`h-4 w-4 transition-all ${
                          idx === selectedIdx ? 'text-primary opacity-100 translate-x-0.5' : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
