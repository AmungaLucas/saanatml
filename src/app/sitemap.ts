import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const SITE_URL = 'https://sanaathrumylens.co.ke'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/makers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ]

  try {
    const [articles, categories, authors] = await Promise.all([
      db.article.findMany({ select: { slug: true, updatedAt: true } }),
      db.category.findMany({ select: { slug: true } }),
      db.author.findMany({ select: { slug: true } }),
    ])

    const articlePages: MetadataRoute.Sitemap = articles.map(a => ({
      url: `${SITE_URL}/articles/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))

    const categoryPages: MetadataRoute.Sitemap = categories.map(c => ({
      url: `${SITE_URL}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    const authorPages: MetadataRoute.Sitemap = authors.map(a => ({
      url: `${SITE_URL}/authors/${a.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

    return [...staticPages, ...articlePages, ...categoryPages, ...authorPages]
  } catch (err) {
    console.error('Sitemap generation error:', err)
    return staticPages
  }
}
