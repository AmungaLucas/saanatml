'use client'

import { Badge } from '@/components/ui/badge'
import { ArticleCard } from '@/components/sanaa/ArticleCard'
import { User, ArrowLeft, Clock, Eye, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { ScrollReveal } from '@/components/sanaa/ScrollReveal'

interface AuthorContentProps {
  author: {
    id: string
    name: string
    slug: string
    bio: string
    avatar: string
    role: string
    articles: any[]
  }
}

export function AuthorContent({ author }: AuthorContentProps) {
  const totalViews = author.articles.reduce((sum: number, a: any) => sum + (a.views || 0), 0)
  const totalReadTime = author.articles.reduce((sum: number, a: any) => sum + (a.readTime || 0), 0)
  const categories = [...new Set(author.articles.map((a: any) => a.category?.name).filter(Boolean))]

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-foreground">{author.name}</span>
      </nav>

      {/* Author Hero */}
      <ScrollReveal direction="up">
        <div className="relative rounded-2xl border border-border bg-card overflow-hidden mb-10">
          {/* Decorative top bar */}
          <div className="h-24 bg-gradient-to-r from-[var(--color-wine)] via-[var(--color-wine)]/80 to-[var(--color-gold)]/60" />

          <div className="px-6 md:px-10 pb-8 -mt-12">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              {/* Avatar */}
              <div className="shrink-0 -mt-4">
                <div className="h-28 w-28 md:h-36 md:w-36 rounded-2xl bg-background border-4 border-background shadow-lg flex items-center justify-center">
                  {author.avatar ? (
                    <img src={author.avatar} alt={author.name} className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <div className="h-full w-full rounded-xl bg-primary/10 flex items-center justify-center">
                      <User className="h-12 w-12 md:h-16 md:w-16 text-primary" />
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pt-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-primary mb-1">{author.role}</p>
                <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">{author.name}</h1>
                <p className="text-muted-foreground leading-relaxed max-w-2xl text-sm md:text-base">{author.bio}</p>

                {/* Categories they write in */}
                {categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Writes about:</span>
                    {categories.map((cat: string) => (
                      <Badge key={cat} variant="outline" className="text-xs font-mono">{cat}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="shrink-0 grid grid-cols-3 gap-4 md:gap-6 pt-2">
                <div className="text-center">
                  <div className="font-serif text-2xl md:text-3xl font-bold">{author.articles.length}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Articles</div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-2xl md:text-3xl font-bold">{totalViews.toLocaleString()}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Views</div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-2xl md:text-3xl font-bold">{totalReadTime}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Min Read</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Articles */}
      <ScrollReveal direction="up" delay={0.1}>
        <section>
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-2xl font-bold">Articles by {author.name}</h2>
            <div className="flex-1 h-px bg-border" />
            <span className="font-mono text-xs text-muted-foreground">{author.articles.length}</span>
          </div>

          {author.articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {author.articles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <p className="font-serif text-lg text-muted-foreground">No articles yet</p>
              <p className="text-sm text-muted-foreground mt-1">Check back soon for stories from {author.name}.</p>
            </div>
          )}
        </section>
      </ScrollReveal>

      {/* Back */}
      <div className="mt-12 pt-8 border-t border-border">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to all stories
        </Link>
      </div>
    </main>
  )
}
