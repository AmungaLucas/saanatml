import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ArticlePageClient } from './ArticlePageClient'
import { SITE_URL } from '@/lib/constants'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
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
        publishedTime: article.publishedAt?.toISOString() || new Date().toISOString(),
        authors: [article.author?.name || 'Unknown'],
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
  } catch {
    return { title: 'Article Not Found' }
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  let article: any
  let related: any[] = []

  try {
    article = await db.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: true,
        comments: { orderBy: { createdAt: 'desc' } },
      },
    })
  } catch {
    notFound()
  }

  if (!article) notFound()

  // Increment views (fire-and-forget, don't block render)
  db.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  }).catch(() => {}) // silently fail — views are non-critical

  try {
    related = await db.article.findMany({
      where: { id: { not: article.id }, categoryId: article.categoryId },
      take: 4,
      include: { category: true, author: true },
      orderBy: { publishedAt: 'desc' },
    })
  } catch {
    related = [] // non-critical, show page without related articles
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage ? `${SITE_URL}${article.coverImage}` : undefined,
    datePublished: article.publishedAt?.toISOString() || new Date().toISOString(),
    dateModified: article.updatedAt?.toISOString() || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: article.author?.name || 'Unknown',
      url: `${SITE_URL}/authors/${article.author?.slug || ''}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Sanaa Through My Lens',
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/articles/${article.slug}`,
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: article.category?.name || '', item: `${SITE_URL}/category/${article.category?.slug || ''}` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE_URL}/articles/${article.slug}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ArticlePageClient
        article={JSON.parse(JSON.stringify({ ...article, views: article.views + 1 }))}
        related={JSON.parse(JSON.stringify(related))}
      />
    </>
  )
}
