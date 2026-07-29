'use client'

import { Badge } from '@/components/ui/badge'
import { ArticleCard } from '@/components/sanaa/ArticleCard'
import { User, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span>Authors</span>
        <span>/</span>
        <span className="text-foreground">{author.name}</span>
      </nav>

      {/* Author Hero */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-12 pb-10 border-b border-border">
        <div className="shrink-0">
          <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-10 w-10 md:h-14 md:w-14 text-primary" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-wider text-primary mb-1">{author.role}</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">{author.name}</h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">{author.bio}</p>
          <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground font-mono">
            <span>{author.articles.length} article{author.articles.length !== 1 ? 's' : ''} published</span>
          </div>
        </div>
      </div>

      {/* Articles */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-serif text-2xl font-bold">Articles by {author.name}</h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        {author.articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {author.articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="font-serif text-lg text-muted-foreground">No articles yet</p>
          </div>
        )}
      </section>

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
