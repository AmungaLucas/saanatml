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
  const category = await db.category.findUnique({ where: { slug } })
  if (!category) return { title: 'Category Not Found' }
  return {
    title: `${category.name} — Sanaa Through My Lens`,
    description: category.description,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = await db.category.findUnique({ where: { slug } })
  if (!category) notFound()

  const [articles, events, allCategories] = await Promise.all([
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

  return (
    <CategoryContent
      category={JSON.parse(JSON.stringify(category))}
      articles={JSON.parse(JSON.stringify(articles.map(a => ({ ...a, commentCount: a.comments.length }))))}
      events={JSON.parse(JSON.stringify(events))}
      allCategories={JSON.parse(JSON.stringify(allCategories))}
    />
  )
}
