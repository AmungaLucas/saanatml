import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { AuthorContent } from './AuthorContent'
import { Header } from '@/components/sanaa/Header'
import { Footer } from '@/components/sanaa/Footer'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const author = await db.author.findUnique({ where: { slug } })
    if (!author) return { title: 'Author Not Found' }
    return {
      title: `${author.name} — Sanaa Through My Lens`,
      description: `${author.role}. ${(author.bio || '').slice(0, 160)}`,
    }
  } catch {
    return { title: 'Author Not Found' }
  }
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params
  let author: any

  try {
    author = await db.author.findUnique({
      where: { slug },
      include: {
        articles: {
          include: { category: true, author: true, comments: { select: { id: true } } },
          orderBy: { publishedAt: 'desc' },
        },
      },
    })
  } catch {
    notFound()
  }

  if (!author) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AuthorContent
          author={JSON.parse(JSON.stringify({
            ...author,
            articles: author.articles.map(a => ({ ...a, commentCount: a.comments.length })),
          }))}
        />
      </main>
      <Footer />
    </div>
  )
}
