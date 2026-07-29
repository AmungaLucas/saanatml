'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, ArrowLeft, ExternalLink, Instagram } from 'lucide-react'
import Link from 'next/link'

interface Maker {
  id: string
  name: string
  slug: string
  discipline: string
  bio: string
  location: string
  website: string
  instagram: string
  twitter: string
  isFeatured: boolean
}

interface MakersPageContentProps {
  makers: Maker[]
}

export function MakersPageContent({ makers }: MakersPageContentProps) {
  const [disciplineFilter, setDisciplineFilter] = useState('all')
  const disciplines = ['all', ...new Set(makers.map(m => m.discipline))]

  const filtered = disciplineFilter === 'all'
    ? makers
    : makers.filter(m => m.discipline === disciplineFilter)

  const featured = makers.filter(m => m.isFeatured)

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span>Cultural Makers</span>
      </nav>

      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-gold text-2xl">&#9670;</span>
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
            Spotlight
          </Badge>
        </div>
        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-3">Cultural Makers</h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          The artists, musicians, filmmakers, and creatives shaping East Africa&rsquo;s cultural landscape
        </p>
        <p className="font-mono text-sm text-muted-foreground mt-2">
          {makers.length} makers featured
        </p>
      </div>

      {/* Featured Makers (Hero Cards) */}
      {featured.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-xl font-bold mb-6">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featured.slice(0, 4).map(maker => (
              <div
                key={maker.id}
                className="group relative rounded-xl border border-primary/20 bg-card overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-lg"
              >
                <div className="h-1 bg-gradient-to-r from-primary via-gold to-primary" />
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <span className="font-serif text-2xl font-bold text-primary">
                        {maker.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-bold text-xl group-hover:text-primary transition-colors">
                        {maker.name}
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-gold mt-1">
                        {maker.discipline}
                      </p>
                      {maker.location && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-2 font-mono">
                          <MapPin className="h-3 w-3" />
                          {maker.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{maker.bio}</p>
                  <div className="flex items-center gap-3 mt-4">
                    {maker.website && (
                      <a href={maker.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-primary font-mono hover:underline">
                        <ExternalLink className="h-2.5 w-2.5" /> Website
                      </a>
                    )}
                    {maker.instagram && (
                      <span className="text-[10px] text-muted-foreground font-mono">{maker.instagram}</span>
                    )}
                    {maker.twitter && (
                      <span className="text-[10px] text-muted-foreground font-mono">{maker.twitter}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="mb-8 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Discipline:</span>
        {disciplines.map(d => (
          <Button
            key={d}
            size="sm"
            variant={disciplineFilter === d ? 'default' : 'outline'}
            onClick={() => setDisciplineFilter(d)}
            className="font-mono text-xs h-7"
          >
            {d === 'all' ? 'All' : d}
          </Button>
        ))}
      </section>

      {/* All Makers Grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(maker => (
            <div
              key={maker.id}
              className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-md"
            >
              <div className="h-0.5 bg-gradient-to-r from-primary/60 to-gold/60" />
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="font-serif text-lg font-bold text-primary">{maker.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-bold text-sm group-hover:text-primary transition-colors">{maker.name}</h3>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-gold mt-0.5">{maker.discipline}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-3 leading-relaxed">{maker.bio}</p>
                <div className="flex items-center justify-between mt-3">
                  {maker.location && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                      <MapPin className="h-3 w-3" /> {maker.location}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    {maker.instagram && <span className="text-[10px] text-muted-foreground">{maker.instagram}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
