'use client'

import { useStore } from '@/store/useStore'
import { Search, Moon, Sun, Menu, BookmarkCheck, History, ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect, useRef } from 'react'
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
  const [catDropdownOpen, setCatDropdownOpen] = useState(false)
  const catRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false)
      }
    }
    if (catDropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [catDropdownOpen])

  const mainNavItems = [
    { label: 'Home', slug: 'home', href: '/', view: 'home' as const },
    { label: 'Events', slug: 'events', href: '/events', view: 'events' as const },
    { label: 'Makers', slug: 'makers', href: '/makers', view: 'makers' as const },
    { label: 'About', slug: 'about', href: '/about', view: 'about' as const },
  ]

  function handleMainNav(item: typeof mainNavItems[number]) {
    if (item.view === 'home') {
      goHome()
    } else {
      setView(item.view)
    }
    setMobileOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCategoryNav(slug: string) {
    setActiveCategory(slug)
    setCatDropdownOpen(false)
    setMobileOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isActiveMain = (item: typeof mainNavItems[number]) => {
    if (item.view === 'home' && currentView === 'home' && activeCategory === 'all') return true
    return currentView === item.view && activeCategory === 'all'
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
            <Link href="/" onClick={goHome} className="flex items-center gap-2.5 group">
              <img src="/icon.png" alt="Sanaa Through My Lens" className="h-8 w-8 rounded-md" />
              <div className="flex flex-col items-start">
                <span className="font-serif text-lg md:text-xl font-bold tracking-tight text-foreground leading-none group-hover:text-primary transition-colors">
                  SANAATHRUMYLENS
                </span>
                <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase hidden sm:block">
                  Art Through My Lens
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainNavItems.map(item => (
              <Link
                key={item.slug}
                href={item.href}
                onClick={(e) => { e.preventDefault(); handleMainNav(item) }}
                className={`animated-underline relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActiveMain(item)
                    ? 'text-primary bg-primary/10 active'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Categories Dropdown */}
            <div ref={catRef} className="relative">
              <button
                onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  catDropdownOpen || (currentView === 'category')
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                Categories
                <ChevronDown className={`h-3 w-3 transition-transform ${catDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {catDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-1 w-52 py-1 rounded-lg border border-border bg-popover shadow-lg z-50"
                  >
                    {categories.map(c => (
                      <Link
                        key={c.slug}
                        href={`/category/${c.slug}`}
                        onClick={(e) => { e.preventDefault(); handleCategoryNav(c.slug) }}
                        className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                          currentView === 'category' && activeCategory === c.slug
                            ? 'text-primary bg-primary/10'
                            : 'text-foreground hover:bg-secondary'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                  <div className="flex items-center gap-2">
                    <img src="/icon.png" alt="Sanaa Through My Lens" className="h-7 w-7 rounded-md" />
                    <div>
                      <span className="font-serif text-lg font-bold">SANAATHRUMYLENS</span>
                      <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                        Art Through My Lens
                      </p>
                    </div>
                  </div>
                </div>
                <nav className="p-4 space-y-1">
                  {mainNavItems.map(item => (
                    <Link
                      key={item.slug}
                      href={item.href}
                      onClick={(e) => { e.preventDefault(); handleMainNav(item) }}
                      className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActiveMain(item)
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {/* All categories in mobile menu */}
                  {categories.length > 0 && (
                    <>
                      <div className="pt-2 mt-2 border-t border-border">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-2">Categories</p>
                      </div>
                      {categories.map(c => (
                        <Link
                          key={c.slug}
                          href={`/category/${c.slug}`}
                          onClick={(e) => { e.preventDefault(); handleCategoryNav(c.slug) }}
                          className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            currentView === 'category' && activeCategory === c.slug
                              ? 'text-primary bg-primary/10'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                          {c.name}
                        </Link>
                      ))}
                    </>
                  )}
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
