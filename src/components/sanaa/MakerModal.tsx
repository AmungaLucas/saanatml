'use client'

import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  X, MapPin, ExternalLink, Globe,
  ArrowLeft, Instagram, Twitter, Share2, Copy, Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export function MakerModal() {
  const { selectedMaker: maker, isMakerOpen, closeMaker } = useStore()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isMakerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMakerOpen])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMakerOpen) closeMaker()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isMakerOpen, closeMaker])

  const handleShare = async () => {
    if (!maker) return
    const text = `${maker.name} — ${maker.discipline} | Sanaa Through My Lens`
    if (navigator.share) {
      try { await navigator.share({ title: maker.name, text }) } catch {}
    } else {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const instagramUrl = maker?.instagram
    ? maker.instagram.startsWith('http')
      ? maker.instagram
      : `https://instagram.com/${maker.instagram.replace(/^@/, '')}`
    : null

  const twitterUrl = maker?.twitter
    ? maker.twitter.startsWith('http')
      ? maker.twitter
      : `https://x.com/${maker.twitter.replace(/^@/, '')}`
    : null

  if (!maker) return null

  return (
    <AnimatePresence>
      {isMakerOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMaker}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl mt-12 mb-8"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Top glass bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 glass rounded-t-2xl">
              <button
                onClick={closeMaker}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-mono text-xs">Back</span>
              </button>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="h-8 gap-1.5 font-mono text-xs"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Share'}
                </Button>
                <button
                  onClick={closeMaker}
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Hero Banner */}
            <div className="relative h-40 bg-gradient-to-br from-[var(--color-wine)] via-[var(--color-wine)]/80 to-[var(--color-gold)]/50">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTJ2NmgtNnYtNmg2em0wIDEydjZoNnYtNmgtNnptMC0xMnY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            </div>

            {/* Avatar overlapping banner */}
            <div className="px-6 md:px-8 -mt-16 relative z-10">
              <div className="h-28 w-28 md:h-32 md:w-32 rounded-2xl bg-background border-4 border-background shadow-xl flex items-center justify-center">
                <span className="font-serif text-4xl md:text-5xl font-bold text-primary">
                  {maker.name.charAt(0)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 md:px-8 py-6 space-y-6">
              {/* Name + Discipline */}
              <div>
                <Badge variant="outline" className="mb-3 font-mono text-xs text-gold border-gold/30">
                  <span className="text-gold mr-1">&#9670;</span>
                  {maker.discipline}
                </Badge>
                <h1 className="font-serif text-2xl md:text-4xl font-bold leading-tight">
                  {maker.name}
                </h1>
              </div>

              {/* Location */}
              {maker.location && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-serif font-semibold">{maker.location}</div>
                    <div className="text-muted-foreground font-mono text-xs">Based in East Africa</div>
                  </div>
                </div>
              )}

              {/* Bio */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {maker.bio}
                </p>
              </div>

              {/* Social / Web Links */}
              <div className="flex flex-wrap gap-3 pt-2">
                {maker.website && (
                  <Button asChild className="gap-2 font-mono text-sm">
                    <a href={maker.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" />
                      Visit Website
                    </a>
                  </Button>
                )}
                {instagramUrl && (
                  <Button variant="outline" asChild className="gap-2 font-mono text-sm">
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </a>
                  </Button>
                )}
                {twitterUrl && (
                  <Button variant="outline" asChild className="gap-2 font-mono text-sm">
                    <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-4 w-4" />
                      X / Twitter
                    </a>
                  </Button>
                )}
              </div>

              {/* Location Map */}
              {maker.location && (
                <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
                  <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-mono text-xs text-muted-foreground">Location</span>
                  </div>
                  <div className="relative h-48 bg-muted/50 flex items-center justify-center">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${maker.location}, Kenya`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <span className="font-mono text-xs">Open in Google Maps</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
