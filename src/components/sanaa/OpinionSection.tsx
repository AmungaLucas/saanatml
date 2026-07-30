'use client'

import { useStore } from '@/store/useStore'
import { ArticleCard } from './ArticleCard'

export function OpinionSection() {
  const { articles, openArticle } = useStore()

  const opinions = articles.filter(a =>
    a.category.slug === 'opinion-commentary'
  ).slice(0, 3)

  if (opinions.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-serif text-2xl md:text-3xl font-bold">
          Opinion <span className="text-muted-foreground">&</span> Commentary
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured opinion */}
        <div className="lg:col-span-2">
          <button
            onClick={() => openArticle(opinions[0])}
            className="w-full text-left group"
          >
            <div className="relative rounded-xl overflow-hidden mb-4 aspect-[16/9]">
              <img
                src={opinions[0].coverImage}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="font-serif font-bold text-xl md:text-2xl text-white leading-tight">
                  {opinions[0].title}
                </p>
                <p className="text-white/70 text-sm mt-2 line-clamp-2">{opinions[0].excerpt}</p>
                <p className="text-white/50 text-xs mt-3 font-mono">
                  By <a href={`/authors/${opinions[0].author.slug}`} onClick={(e) => e.stopPropagation()} className="hover:text-white/70 transition-colors">{opinions[0].author.name}</a> &middot; {opinions[0].readTime} min read
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Side opinions */}
        <div className="space-y-5">
          {opinions.slice(1).map(article => (
            <button
              key={article.id}
              onClick={() => openArticle(article)}
              className="w-full text-left group"
            >
              <ArticleCard article={article} variant="horizontal" />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
