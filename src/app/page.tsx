'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Header } from '@/components/sanaa/Header'
import { TrendingTicker } from '@/components/sanaa/TrendingTicker'
import { HeroCarousel } from '@/components/sanaa/HeroCarousel'
import { StoryGrid } from '@/components/sanaa/StoryGrid'
import { LensPicks } from '@/components/sanaa/LensPicks'
import { CulturalMakers } from '@/components/sanaa/CulturalMakers'
import { FromTheArchive } from '@/components/sanaa/FromTheArchive'
import { OpinionSection } from '@/components/sanaa/OpinionSection'
import { EventsSection } from '@/components/sanaa/EventsSection'
import { ArticleModal } from '@/components/sanaa/ArticleModal'
import { SearchModal } from '@/components/sanaa/SearchModal'
import { Footer } from '@/components/sanaa/Footer'
import { AboutPage } from '@/components/sanaa/AboutPage'
import { EventsPage } from '@/components/sanaa/EventsPage'
import { CategoryPage } from '@/components/sanaa/CategoryPage'
import { NewsletterCTA } from '@/components/sanaa/NewsletterCTA'
import { StoryGridSkeleton } from '@/components/sanaa/Skeletons'

function HomePage() {
  const makers = useStore(s => s.makers)

  return (
    <div className="animate-fadeIn" key="home">
      {/* Value Proposition */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-2">
        <div className="text-center max-w-2xl mx-auto">
          <p className="font-serif text-lg md:text-xl text-muted-foreground italic leading-relaxed">
            &ldquo;Discover the stories, voices, and perspectives shaping East Africa&rsquo;s creative landscape.&rdquo;
          </p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Explore</span>
            <span className="text-primary/30">&#8226;</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Experience</span>
            <span className="text-primary/30">&#8226;</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Examine</span>
          </div>
        </div>
      </section>

      <HeroCarousel />

      <div className="py-8 md:py-12">
        <StoryGrid />
      </div>

      {/* Lens Picks Editorial Section */}
      <div className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6"><div className="h-px bg-border mb-8" /></div>
        <LensPicks />
      </div>

      <div className="py-8 md:py-12">
        <FromTheArchive />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6"><div className="h-px bg-border" /></div>

      <div className="py-8 md:py-12">
        <OpinionSection />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6"><div className="h-px bg-border" /></div>

      <div className="py-8 md:py-12">
        <EventsSection />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6"><div className="h-px bg-border" /></div>

      {/* Cultural Makers Spotlight */}
      <div className="py-8 md:py-12">
        <CulturalMakers makers={makers} />
      </div>

      {/* Newsletter CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <NewsletterCTA variant="hero" />
      </section>
    </div>
  )
}

export default function Home() {
  const store = useStore()
  const currentView = useStore(s => s.currentView)
  const dataLoaded = useStore(s => s.dataLoaded)

  useEffect(() => {
    async function fetchData() {
      try {
        const [articlesRes, featuredRes, categoriesRes, eventsRes, authorsRes, makersRes] = await Promise.all([
          fetch('/api/articles?limit=20'),
          fetch('/api/articles?featured=true&limit=3'),
          fetch('/api/categories'),
          fetch('/api/events'),
          fetch('/api/authors'),
          fetch('/api/makers'),
        ])
        const [articles, featured, categories, events, authors, makers] = await Promise.all([
          articlesRes.json(),
          featuredRes.json(),
          categoriesRes.json(),
          eventsRes.json(),
          authorsRes.json(),
          makersRes.json(),
        ])
        store.setArticles(articles.articles || [])
        store.setFeaturedArticles(featured.articles || [])
        store.setCategories(categories || [])
        store.setEvents(events || [])
        store.setAuthors(authors || [])
        store.setMakers(makers || [])
        store.setDataLoaded(true)
      } catch (err) {
        console.error('Failed to fetch data:', err)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {currentView === 'home' && <TrendingTicker />}

      <main className="flex-1">
        {currentView === 'home' && (
          dataLoaded ? <HomePage /> : (
            <div className="py-8 md:py-12">
              <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <div className="h-8 w-64 bg-secondary rounded-lg mx-auto mb-4" />
                  <div className="h-4 w-48 bg-secondary rounded mx-auto" />
                </div>
                <div className="h-[400px] bg-secondary rounded-2xl mb-8" />
                <StoryGridSkeleton />
              </div>
            </div>
          )
        )}
        {currentView === 'about' && <div className="animate-fadeIn" key="about"><AboutPage /></div>}
        {currentView === 'events' && <div className="animate-fadeIn" key="events"><EventsPage /></div>}
        {currentView === 'category' && <div className="animate-fadeIn" key="category"><CategoryPage /></div>}
      </main>

      <Footer />
      <ArticleModal />
      <SearchModal />
    </div>
  )
}
