'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface EventItem {
  id: string
  title: string
  description: string
  date: string
  endDate?: string | null
  venue: string
  city: string
  category: string
  categoryId?: string | null
  categoryRef?: { name: string; color: string } | null
  imageUrl: string
  ticketUrl: string
  isFeatured: boolean
  isPast: boolean
}

interface EventsContentProps {
  events: EventItem[]
}

export function EventsContent({ events }: EventsContentProps) {
  const [cityFilter, setCityFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [showPast, setShowPast] = useState(false)

  const cities = [...new Set(events.map(e => e.city))]
  const eventCategories = [...new Set(events.map(e => e.category))]

  const filtered = events.filter(e => {
    if (!showPast && e.isPast) return false
    if (cityFilter !== 'all' && e.city !== cityFilter) return false
    if (catFilter !== 'all' && e.category !== catFilter) return false
    return true
  })

  const upcoming = filtered.filter(e => !e.isPast)
  const past = filtered.filter(e => e.isPast)
  const featuredEvents = upcoming.filter(e => e.isFeatured)

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span>Events</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-3">Events</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Art exhibitions, festivals, concerts, launches and cultural happenings in Kenya and East Africa
        </p>
      </div>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif text-xl font-bold mb-4">Featured Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredEvents.map(event => (
              <div key={event.id} className="relative rounded-xl overflow-hidden group cursor-pointer" style={{ minHeight: '220px' }}>
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm border-0 text-[10px] mb-2">
                    {event.category}
                  </Badge>
                  <h3 className="font-serif font-bold text-lg text-white">{event.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-white/70 text-xs">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.venue}, {event.city}
                    </span>
                    {event.ticketUrl && (
                      <span className="flex items-center gap-1 ml-auto">
                        <ExternalLink className="h-3 w-3" />
                        Tickets
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="mb-8 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Category:</span>
          <Button size="sm" variant={catFilter === 'all' ? 'default' : 'outline'} onClick={() => setCatFilter('all')} className="font-mono text-xs h-7">All</Button>
          {eventCategories.map(cat => (
            <Button key={cat} size="sm" variant={catFilter === cat ? 'default' : 'outline'} onClick={() => setCatFilter(cat)} className="font-mono text-xs h-7">{cat}</Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">City:</span>
          <Button size="sm" variant={cityFilter === 'all' ? 'default' : 'outline'} onClick={() => setCityFilter('all')} className="font-mono text-xs h-7">All</Button>
          {cities.map(city => (
            <Button key={city} size="sm" variant={cityFilter === city ? 'default' : 'outline'} onClick={() => setCityFilter(city)} className="font-mono text-xs h-7">{city}</Button>
          ))}
        </div>
        <Button size="sm" variant={showPast ? 'default' : 'ghost'} onClick={() => setShowPast(!showPast)} className="font-mono text-xs h-7 ml-auto">
          {showPast ? 'Hide Past' : 'Show Past'}
        </Button>
      </section>

      {/* Upcoming Events */}
      <section className="mb-10">
        <h2 className="font-serif text-xl font-bold mb-4">
          Upcoming Events
          <span className="text-muted-foreground font-mono text-sm font-normal ml-3">({upcoming.length})</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcoming.map(event => (
            <div key={event.id} className="flex gap-4 p-5 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors cursor-pointer group">
              <div className="text-center shrink-0">
                <div className="font-mono text-xs text-primary uppercase">
                  {new Date(event.date).toLocaleDateString('en-KE', { month: 'short' })}
                </div>
                <div className="font-serif text-3xl font-bold leading-none">{new Date(event.date).getDate()}</div>
                <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                  {new Date(event.date).toLocaleDateString('en-KE', { weekday: 'short' })}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{event.venue}, {event.city}</span>
                </div>
                <Badge variant="outline" className="mt-2 text-[10px]">{event.category}</Badge>
                {event.ticketUrl && (
                  <a href={event.ticketUrl} className="inline-flex items-center gap-1 text-[10px] text-primary font-mono mt-2 hover:underline" onClick={e => e.stopPropagation()} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-2.5 w-2.5" /> Get Tickets
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Past Events */}
      {showPast && past.length > 0 && (
        <section>
          <h2 className="font-serif text-xl font-bold mb-4">
            Past Events
            <span className="text-muted-foreground font-mono text-sm font-normal ml-3">({past.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {past.map(event => (
              <div key={event.id} className="flex gap-4 p-5 rounded-xl border border-border bg-muted/30 opacity-70 cursor-pointer group">
                <div className="text-center shrink-0">
                  <div className="font-mono text-xs text-muted-foreground uppercase">{new Date(event.date).toLocaleDateString('en-KE', { month: 'short' })}</div>
                  <div className="font-serif text-3xl font-bold leading-none text-muted-foreground">{new Date(event.date).getDate()}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-semibold text-sm text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">{event.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{event.venue}, {event.city}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="font-serif text-lg text-muted-foreground">No events match your filters</p>
          <Button variant="outline" onClick={() => { setCatFilter('all'); setCityFilter('all'); setShowPast(false) }} className="mt-4 font-mono text-xs">Clear Filters</Button>
        </div>
      )}
    </main>
  )
}
