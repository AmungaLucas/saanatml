'use client'

import { useStore } from '@/store/useStore'
import { Badge } from '@/components/ui/badge'
import { MapPin, Instagram, ArrowRight } from 'lucide-react'

export function CulturalMakers() {
  const { makers, openMaker } = useStore()
  const featured = makers.filter(m => m.isFeatured).slice(0, 4)

  if (featured.length === 0) return null

  const handleMakerClick = (e: React.MouseEvent, maker: typeof makers[0]) => {
    if ((e.target as HTMLElement).closest('a')) return
    openMaker(maker)
  }

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-gold text-lg">&#9670;</span>
        <h2 className="font-serif text-2xl md:text-3xl font-bold">
          Cultural Makers
        </h2>
        <div className="flex-1 h-px bg-border" />
        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
          Spotlight
        </Badge>
      </div>
      <p className="text-muted-foreground mb-8 text-sm">
        The artists, musicians, filmmakers, and creatives shaping East Africa&rsquo;s cultural landscape
      </p>

      {/* Featured Makers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {featured.map((maker) => (
          <div
            key={maker.id}
            className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg cursor-pointer"
            onClick={(e) => handleMakerClick(e, maker)}
          >
            {/* Decorative top accent */}
            <div className="h-1 bg-gradient-to-r from-primary via-gold to-primary" />

            <div className="p-5">
              {/* Avatar placeholder */}
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <span className="font-serif text-xl font-bold text-primary">
                  {maker.name.charAt(0)}
                </span>
              </div>

              <h3 className="font-serif font-bold text-base group-hover:text-primary transition-colors leading-snug">
                {maker.name}
              </h3>
              <p className="font-mono text-[10px] uppercase tracking-wider text-gold mt-1">
                {maker.discipline}
              </p>

              <p className="text-sm text-muted-foreground mt-3 line-clamp-3 leading-relaxed">
                {maker.bio}
              </p>

              {/* Location */}
              {maker.location && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-3 font-mono">
                  <MapPin className="h-3 w-3" />
                  {maker.location}
                </p>
              )}

              {/* Social Links */}
              <div className="flex items-center gap-2 mt-3">
                {maker.instagram && (
                  <a
                    href={maker.instagram.startsWith('http') ? maker.instagram : `https://instagram.com/${maker.instagram.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[10px] text-primary font-mono hover:underline"
                  >
                    <Instagram className="h-3 w-3" />
                    {maker.instagram.replace(/^@/, '')}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="text-center mt-8">
        <a href="/makers" className="inline-flex items-center gap-2 text-sm font-mono text-primary hover:underline">
          View all cultural makers <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  )
}
