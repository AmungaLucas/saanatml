'use client'

import { useStore } from '@/store/useStore'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin } from 'lucide-react'

export function EventsSection() {
  const { events } = useStore()
  const upcoming = events.filter(e => !e.isPast).slice(0, 4)
  const past = events.filter(e => e.isPast).slice(0, 3)

  if (events.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl md:text-3xl font-bold">Events This Week</h2>
      </div>
      <p className="text-muted-foreground mb-6 text-sm">
        Art exhibitions, festivals, concerts, and cultural happenings
      </p>

      {/* Featured Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {upcoming.filter(e => e.isFeatured).map(event => (
          <div
            key={event.id}
            className="relative rounded-xl overflow-hidden group cursor-pointer"
          >
            <div className="aspect-[16/9]">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm border-0 text-[10px] mb-2">
                {event.category}
              </Badge>
              <h3 className="font-serif font-bold text-lg text-white">{event.title}</h3>
              <div className="flex items-center gap-3 mt-2 text-white/70 text-xs">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(event.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.venue}, {event.city}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {upcoming.map(event => (
          <div
            key={event.id}
            className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors cursor-pointer group"
          >
            <div className="text-center shrink-0">
              <div className="font-mono text-xs text-primary uppercase">
                {new Date(event.date).toLocaleDateString('en-KE', { month: 'short' })}
              </div>
              <div className="font-serif text-2xl font-bold">{new Date(event.date).getDate()}</div>
              <div className="font-mono text-[10px] text-muted-foreground">
                {new Date(event.date).toLocaleDateString('en-KE', { weekday: 'short' })}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                {event.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {event.venue}, {event.city}
              </p>
              <Badge variant="outline" className="mt-2 text-[10px]">{event.category}</Badge>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
