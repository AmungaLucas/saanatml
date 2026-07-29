'use client'

import { useStore } from '@/store/useStore'
import { Search, Moon, Sun, Menu, BookmarkCheck, History } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export function Header() {
  const { toggleSearch, categories, activeCategory, currentView, setActiveCategory, setView, goHome, bookmarks, readingHistory } = useStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'Home', slug: 'all', href: '/', view: 'home' as const },
    ...categories.slice(0, 6).map(c => ({ label: c.name, slug: c.slug, href: `/category/${c.slug}`, view: 'category' as const })),
    { label: 'Events', slug: 'events', href: '/events', view: 'events' as const },
    { label: 'Makers', slug: 'makers', href: '/makers', view: 'events' as const },
    { label: 'About', slug: 'about', href: '/about', view: 'about' as const },
  ]

  function handleNav(item: typeof navItems[number]) {
    if (item.view === 'home') {
      goHome()
    } else if (item.view === 'category') {
      setActiveCategory(item.slug)
    } else {
      setView(item.view)
    }
    setMobileOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isActive = (item: typeof navItems[number]) => {
    if (item.view === 'home' && currentView === 'home' && activeCategory === 'all') return true
    if (item.view === 'category' && currentView === 'category' && activeCategory === item.slug) return true
    if (item.view === 'events' && currentView === 'events') return true
    if (item.view === 'about' && currentView === 'about') return true
    return false
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-background/90 backdrop-blur-xl border-b border-border shadow-sm'
        : 'bg-background/70 backdrop-blur-lg border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/" onClick={goHome} className="flex flex-col items-start group">
              <span className="font-serif text-xl md:text-2xl font-bold tracking-tight text-foreground leading-none group-hover:text-primary transition-colors">
                SANAATHRUMYLENS
              </span>
              <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase hidden sm:block">
                Art Through My Lens
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.slug}
                href={item.href}
                onClick={(e) => { e.preventDefault(); handleNav(item) }}
                className={`animated-underline relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isActive(item)
                    ? 'text-primary bg-primary/10 active'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Bookmarks indicator */}
            <AnimatePresence>
              {bookmarks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="hidden sm:flex"
                >
                  <Link href="/" className="p-2 rounded-md hover:bg-secondary transition-colors flex items-center gap-1 text-xs text-muted-foreground" title={`${bookmarks.length} bookmarked`}>
                    <BookmarkCheck className="h-4 w-4 text-gold" />
                    <span className="font-mono">{bookmarks.length}</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reading History */}
            <AnimatePresence>
              {readingHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="hidden sm:block"
                >
                  <button
                    className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
                    title={`${readingHistory.length} articles read`}
                  >
                    <History className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search */}
            <button
              onClick={toggleSearch}
              className="p-2 rounded-md hover:bg-secondary transition-colors"
              aria-label="Search (Ctrl+K)"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Theme toggle */}
            {mounted && (
              <motion.button
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-md hover:bg-secondary transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.button>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="p-2">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-72 bg-background border-l border-border p-0">
                <div className="p-6 border-b border-border">
                  <span className="font-serif text-lg font-bold">SANAATHRUMYLENS</span>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase mt-1">
                    Art Through My Lens
                  </p>
                </div>
                <nav className="p-4 space-y-1">
                  {navItems.map(item => (
                    <Link
                      key={item.slug}
                      href={item.href}
                      onClick={(e) => { e.preventDefault(); handleNav(item) }}
                      className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item)
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                {/* Reading History in mobile menu */}
                {readingHistory.length > 0 && (
                  <div className="px-4 pb-4 border-t border-border pt-4">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <History className="h-3 w-3" /> Recently Read
                    </p>
                    <div className="space-y-1">
                      {readingHistory.slice(0, 4).map(h => (
                        <Link
                          key={h.articleId}
                          href={`/articles/${h.slug}`}
                          className="block text-xs text-muted-foreground hover:text-foreground transition-colors line-clamp-1 py-1"
                        >
                          {h.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
