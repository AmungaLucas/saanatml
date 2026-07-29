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
import { AboutPage } from '@/components/sanaa/AboutPage'
import { EventsPage } from '@/components/sanaa/EventsPage'
import { CategoryPage } from '@/components/sanaa/CategoryPage'
import { NewsletterCTA } from '@/components/sanaa/NewsletterCTA'

function HomePage() {
  return (
    <>
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

      <div className="max-w-7xl mx-auto px-4 md:px-6"><div className="h-px bg-border" /></div>

      <div className="py-8 md:py-12">
        <OpinionSection />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6"><div className="h-px bg-border" /></div>

      <div className="py-8 md:py-12">
        <EventsSection />
      </div>

      {/* Newsletter CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <NewsletterCTA variant="hero" />
      </section>
    </>
  )
}

export default function Home() {
  const store = useStore()
  const currentView = useStore(s => s.currentView)

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
        const [articles, featured, categories, events, authors] = await Promise.all([
          articlesRes.json(),
          featuredRes.json(),
          categoriesRes.json(),
          eventsRes.json(),
          authorsRes.json(),
        ])
        store.setArticles(articles.articles || [])
        store.setFeaturedArticles(featured.articles || [])
        store.setCategories(categories || [])
        store.setEvents(events || [])
        store.setAuthors(authors || [])
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
        {currentView === 'home' && <HomePage />}
        {currentView === 'about' && <AboutPage />}
        {currentView === 'events' && <EventsPage />}
        {currentView === 'category' && <CategoryPage />}
      </main>

      <Footer />
      <ArticleModal />
      <SearchModal />
    </div>
  )
}
