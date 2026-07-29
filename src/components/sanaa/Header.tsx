'use client'

import { useStore } from '@/store/useStore'
import { Search, Moon, Sun, Menu, BookmarkCheck } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Link from 'next/link'

export function Header() {
  const { toggleSearch, categories, activeCategory, currentView, setActiveCategory, setView, goHome, bookmarks } = useStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (typeof window !== 'undefined' && !mounted) {
    setMounted(true)
  }

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
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/" onClick={goHome} className="flex flex-col items-start">
              <span className="font-serif text-xl md:text-2xl font-bold tracking-tight text-foreground leading-none">
                SANAATHRUMYLENS
              </span>
              <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase hidden sm:block">
                Art Through My Lens
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.slug}
                href={item.href}
                onClick={(e) => { e.preventDefault(); handleNav(item) }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isActive(item)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            {bookmarks.length > 0 && (
              <Link href="/" className="p-2 rounded-md hover:bg-secondary transition-colors hidden sm:flex items-center gap-1 text-xs text-muted-foreground" title={`${bookmarks.length} bookmarked`}>
                <BookmarkCheck className="h-4 w-4 text-gold" />
                <span className="font-mono">{bookmarks.length}</span>
              </Link>
            )}

            <button
              onClick={toggleSearch}
              className="p-2 rounded-md hover:bg-secondary transition-colors"
              aria-label="Search (Ctrl+K)"
            >
              <Search className="h-4 w-4" />
            </button>

            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-md hover:bg-secondary transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="p-2">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-72 bg-background border-l border-border p-0">
                <div className="p-6 border-b border-border">
                  <span className="font-serif text-lg font-bold">SANAATHRUMYLENS</span>
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
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
