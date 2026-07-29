'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Header } from '@/components/sanaa/Header'
import { TrendingTicker } from '@/components/sanaa/TrendingTicker'
import { HeroCarousel } from '@/components/sanaa/HeroCarousel'
import { StoryGrid } from '@/components/sanaa/StoryGrid'
import { OpinionSection } from '@/components/sanaa/OpinionSection'
import { EventsSection } from '@/components/sanaa/EventsSection'
import { ArticleModal } from '@/components/sanaa/ArticleModal'
import { SearchModal } from '@/components/sanaa/SearchModal'
import { Footer } from '@/components/sanaa/Footer'

export default function Home() {
  const store = useStore()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [articlesRes, featuredRes, categoriesRes, eventsRes, authorsRes] = await Promise.all([
          fetch('/api/articles?limit=20'),
          fetch('/api/articles?featured=true&limit=3'),
          fetch('/api/categories'),
          fetch('/api/events'),
          fetch('/api/authors'),
        ])

        const articles = await articlesRes.json()
        const featured = await featuredRes.json()
        const categories = await categoriesRes.json()
        const events = await eventsRes.json()
        const authors = await authorsRes.json()

        store.setArticles(articles.articles || [])
        store.setFeaturedArticles(featured.articles || [])
        store.setCategories(categories || [])
        store.setEvents(events || [])
        store.setAuthors(authors || [])
        setLoaded(true)
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setLoaded(true)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <TrendingTicker />

      <main className="flex-1">
        {/* Value Proposition */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-2">
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-serif text-lg md:text-xl text-muted-foreground italic leading-relaxed">
              &ldquo;Discover the stories, voices, and perspectives shaping East Africa&rsquo;s creative landscape.&rdquo;
            </p>
            <div className="flex items-center justify-center gap-6 mt-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Explore
              </span>
              <span className="text-primary/30">&#8226;</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Experience
              </span>
              <span className="text-primary/30">&#8226;</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Examine
              </span>
            </div>
          </div>
        </section>

        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Story Grid with Sidebar */}
        <div className="py-8 md:py-12">
          <StoryGrid />
        </div>

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="h-px bg-border" />
        </div>

        {/* Opinion & Commentary */}
        <div className="py-8 md:py-12">
          <OpinionSection />
        </div>

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="h-px bg-border" />
        </div>

        {/* Events */}
        <div className="py-8 md:py-12">
          <EventsSection />
        </div>

        {/* Newsletter CTA */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">
              This Week in East African Arts
            </h2>
            <p className="text-primary-foreground/80 max-w-lg mx-auto mb-6 text-sm md:text-base">
              Get our weekly newsletter with curated event picks, new reviews, and exclusive content from the East African art scene.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                placeholder="Your name (optional)"
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary-foreground/50"
              />
              <input
                placeholder="Your email address"
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary-foreground/50"
              />
              <button className="px-6 py-2.5 rounded-lg bg-primary-foreground text-primary font-mono text-xs font-semibold hover:bg-primary-foreground/90 transition-colors shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ArticleModal />
      <SearchModal />
    </div>
  )
}
