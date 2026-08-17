import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { AboutContent } from './AboutContent'

export const metadata: Metadata = {
  title: 'About — Sanaa Through My Lens',
  description: 'An arts & culture opinion blog highlighting stories around the art scene in Kenya and East Africa — music, film, book reviews, commentary, events, and infortainment.',
}

export default async function AboutPage() {
  let categories: any[] = []
  let authors: any[] = []

  try {
    ;[categories, authors] = await Promise.all([
      db.category.findMany({ orderBy: { name: 'asc' } }),
      db.author.findMany({ orderBy: { name: 'asc' } }),
    ])
  } catch {
    // Show page with empty data on DB failure
  }

  return <AboutContent categories={JSON.parse(JSON.stringify(categories))} authors={JSON.parse(JSON.stringify(authors))} />
}
