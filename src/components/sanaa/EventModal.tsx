'use client'

import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  X, Calendar, MapPin, Clock, ExternalLink,
  Share2, Copy, Check, ArrowLeft
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export function EventModal() {
  const { selectedEvent: event, isEventOpen, closeEvent } = useStore()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isEventOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isEventOpen])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEventOpen) closeEvent()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isEventOpen, closeEvent])

  const handleShare = async () => {
    if (!event) return
    const text = `${event.title} — ${new Date(event.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })} at ${event.venue}, ${event.city}`
    if (navigator.share) {
      try { await navigator.share({ title: event.title, text, url: window.location.href }) } catch {}
    } else {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })

  if (!event) return null

  const isMultiDay = event.endDate && event.endDate !== event.date

  return (
    <AnimatePresence>
      {isEventOpen && (
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
            onClick={closeEvent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl mt-8 mb-8"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Top glass bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 glass rounded-t-2xl">
              <button
                onClick={closeEvent}
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
                  onClick={closeEvent}
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              {event.isPast && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-black/50 text-white backdrop-blur-sm border-0">Past Event</Badge>
                </div>
              )}
              {event.isFeatured && !event.isPast && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-[var(--color-wine)] text-white border-0">Featured</Badge>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="px-6 md:px-8 py-6 space-y-6">
              {/* Category + Title */}
              <div>
                <Badge variant="outline" className="mb-3 font-mono text-xs">
                  {event.category}
                </Badge>
                <h1 className="font-serif text-2xl md:text-4xl font-bold leading-tight">
                  {event.title}
                </h1>
              </div>

              {/* Date & Time */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-start gap-3 text-sm">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-serif font-semibold">{formatDate(event.date)}</div>
                    <div className="text-muted-foreground font-mono text-xs">{formatTime(event.date)}</div>
                    {isMultiDay && (
                      <div className="text-muted-foreground text-xs mt-1">
                        to {formatDate(event.endDate!)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Venue */}
                <div className="flex items-start gap-3 text-sm">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-serif font-semibold">{event.venue}</div>
                    <div className="text-muted-foreground font-mono text-xs">{event.city}</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                {event.ticketUrl && !event.isPast && (
                  <Button asChild className="gap-2 font-mono text-sm">
                    <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Get Tickets
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="gap-2 font-mono text-sm"
                >
                  {copied ? <Copy className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Share Event'}
                </Button>
              </div>

              {/* Google Maps embed placeholder */}
              <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-mono text-xs text-muted-foreground">Venue Location</span>
                </div>
                <div className="relative h-48 bg-muted/50 flex items-center justify-center">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue}, ${event.city}, Kenya`)}`}
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
