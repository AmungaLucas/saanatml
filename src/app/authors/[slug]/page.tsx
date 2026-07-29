import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { AuthorContent } from './AuthorContent'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const authors = await db.author.findMany({ select: { slug: true } })
  return authors.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const author = await db.author.findUnique({ where: { slug } })
  if (!author) return { title: 'Author Not Found' }
  return {
    title: `${author.name} — Sanaa Through My Lens`,
    description: `${author.role}. ${author.bio.slice(0, 160)}`,
  }
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params
  const author = await db.author.findUnique({
    where: { slug },
    include: {
      articles: {
        include: { category: true, author: true, comments: { select: { id: true } } },
        orderBy: { publishedAt: 'desc' },
      },
    },
  })

  if (!author) notFound()

  return (
    <AuthorContent
      author={JSON.parse(JSON.stringify({
        ...author,
        articles: author.articles.map(a => ({ ...a, commentCount: a.comments.length })),
      }))}
    />
  )
}
