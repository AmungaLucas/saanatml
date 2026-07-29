'use client'

import { useStore } from '@/store/useStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArticleCard } from './ArticleCard'
import { TrendingUp, Calendar, ArrowRight } from 'lucide-react'

export function Sidebar() {
  const { articles, events, openArticle, setActiveCategory } = useStore()

  const trending = articles.slice(0, 5)
  const upcomingEvents = events.filter(e => !e.isPast).slice(0, 3)

  return (
    <aside className="space-y-8">
      {/* Trending */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Trending Now
        </h3>
        <div className="space-y-1">
          {trending.map((article, i) => (
            <div key={article.id} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
              <span className="font-mono text-lg font-bold text-primary/60 shrink-0 w-6">
                {String(i + 1).padStart(2, '0')}
              </span>
              <button onClick={() => openArticle(article)} className="flex-1 text-left min-w-0">
                <p className="font-serif font-semibold text-sm line-clamp-2 hover:text-primary transition-colors leading-snug">
                  {article.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  {article.readTime} min read
                </p>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gold" />
          Upcoming Events
        </h3>
        <div className="space-y-3">
          {upcomingEvents.map(event => (
            <div key={event.id} className="flex gap-3 items-start">
              <div className="text-center shrink-0 w-12">
                <div className="font-mono text-xs text-primary uppercase">
                  {new Date(event.date).toLocaleDateString('en-KE', { month: 'short' })}
                </div>
                <div className="font-serif text-xl font-bold">
                  {new Date(event.date).getDate()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif font-semibold text-sm line-clamp-1">{event.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {event.venue}, {event.city}
                </p>
                <Badge variant="outline" className="mt-1 text-[10px]">{event.category}</Badge>
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          className="w-full mt-4 text-xs font-mono"
          onClick={() => setActiveCategory('events')}
        >
          View All Events <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* Newsletter Inline CTA */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
        <h3 className="font-serif font-bold text-lg mb-2">This Week in EA Arts</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Curated event picks, new reviews, and exclusive content from the East African art scene.
        </p>
        <ul className="text-xs text-muted-foreground space-y-1.5 mb-4 font-mono">
          <li className="flex items-center gap-2">
            <span className="text-primary">&#10022;</span> Event Picks
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">&#10022;</span> New Reviews
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">&#10022;</span> Exclusive Content
          </li>
        </ul>
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs" size="sm">
          Subscribe to Newsletter
        </Button>
      </div>
    </aside>
  )
}
