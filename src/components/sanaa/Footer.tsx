'use client'

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowUp, Send, Check } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function Footer() {
  const { categories, setActiveCategory } = useStore()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubscribe = async () => {
    if (!email.trim()) return
    setSubscribing(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: '' }),
      })
      if (res.ok) {
        setSubscribed(true)
        setEmail('')
      }
    } catch {}
    setSubscribing(false)
  }

  const socialLinks = [
    { label: 'X', href: '#', icon: null },
    { label: 'Instagram', href: '#', icon: <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
    { label: 'Facebook', href: '#', icon: <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
    { label: 'YouTube', href: '#', icon: <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  ]

  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="block group">
              <span className="font-serif text-xl font-bold group-hover:text-primary transition-colors">SANAATHRUMYLENS</span>
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase mt-1">
                Art Through My Lens
              </p>
            </Link>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              An arts &amp; culture opinion blog highlighting stories around the art scene in Kenya and East Africa &mdash; music, film, book reviews, commentary, events, and infortainment.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-5">
              {socialLinks.map(link => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  whileHover={{ y: -2 }}
                  className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors text-xs font-bold"
                  aria-label={link.label}
                >
                  {link.icon || link.label}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Categories
            </h4>
            <ul className="space-y-2">
              {categories.map(c => (
                <li key={c.id}>
                  <Link
                    href={`/category/${c.slug}`}
                    onClick={(e) => { e.preventDefault(); setActiveCategory(c.slug) }}
                    className="text-sm text-foreground/70 hover:text-primary transition-colors inline-flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-foreground/70 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/events" className="text-sm text-foreground/70 hover:text-primary transition-colors">Events</Link></li>
              <li><Link href="/makers" className="text-sm text-foreground/70 hover:text-primary transition-colors">Cultural Makers</Link></li>
              <li><button className="text-sm text-foreground/70 hover:text-primary transition-colors">Advertise with Us</button></li>
              <li><button onClick={() => useStore.getState().toggleSearch()} className="text-sm text-foreground/70 hover:text-primary transition-colors">Search</button></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              This Week in EA Arts
            </h4>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Subscribe to our weekly newsletter for curated stories, events, and perspectives.
            </p>
            {!subscribed ? (
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                  className="h-9 text-sm flex-1"
                />
                <Button
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={handleSubscribe}
                  disabled={subscribing || !email.trim()}
                >
                  {subscribing ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-3 w-3 border-2 border-primary-foreground border-t-transparent rounded-full" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span>Subscribed! Check your inbox.</span>
              </motion.div>
            )}
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Sanaa Through My Lens. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p className="font-mono">
              Arts &amp; Culture Opinion Blog &mdash; Kenya &amp; East Africa
            </p>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
              aria-label="Back to top"
            >
              <ArrowUp className="h-3 w-3" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  )
}
