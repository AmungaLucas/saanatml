import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { CategoryContent } from './CategoryContent'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const category = await db.category.findUnique({ where: { slug } })
    if (!category) return { title: 'Category Not Found' }
    return {
      title: `${category.name} — Sanaa Through My Lens`,
      description: category.description,
    }
  } catch {
    return { title: 'Category Not Found' }
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  let category: any
  try {
    category = await db.category.findUnique({ where: { slug } })
  } catch {
    notFound()
  }
  if (!category) notFound()

  let articles: any[] = []
  let events: any[] = []
  let allCategories: any[] = []

  try {
    ;[articles, events, allCategories] = await Promise.all([
      db.article.findMany({
        where: { categoryId: category.id },
        include: { category: true, author: true, comments: { select: { id: true } } },
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      }),
      db.event.findMany({
        where: { isPast: false, category: category.name },
        orderBy: { date: 'asc' },
        take: 6,
      }),
      db.category.findMany({ orderBy: { name: 'asc' } }),
    ])
  } catch {
    // If data fetch fails, show page with empty data rather than crashing
  }

  return (
    <CategoryContent
      category={JSON.parse(JSON.stringify(category))}
      articles={JSON.parse(JSON.stringify(articles.map(a => ({ ...a, commentCount: a.comments.length }))))}
      events={JSON.parse(JSON.stringify(events))}
      allCategories={JSON.parse(JSON.stringify(allCategories))}
    />
  )
}
