import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ArticlePageClient } from './ArticlePageClient'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const articles = await db.article.findMany({ select: { slug: true } })
  return articles.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await db.article.findUnique({
    where: { slug },
    include: { category: true, author: true },
  })
  if (!article) return { title: 'Article Not Found' }

  return {
    title: `${article.title} — Sanaa Through My Lens`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt.toISOString(),
      authors: [article.author.name],
      tags: article.tags ? article.tags.split(',').map(t => t.trim()) : [],
      images: article.coverImage ? [{ url: article.coverImage, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.coverImage ? [article.coverImage] : [],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await db.article.findUnique({
    where: { slug },
    include: {
      category: true,
      author: true,
      comments: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!article) notFound()

  // Increment views
  await db.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  })

  // Get related articles
  const related = await db.article.findMany({
    where: { id: { not: article.id }, categoryId: article.categoryId },
    take: 4,
    include: { category: true, author: true },
    orderBy: { publishedAt: 'desc' },
  })

  return (
    <ArticlePageClient
      article={JSON.parse(JSON.stringify({ ...article, views: article.views + 1 }))}
      related={JSON.parse(JSON.stringify(related))}
    />
  )
}
