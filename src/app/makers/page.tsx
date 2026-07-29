import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { MakersPageContent } from './MakersPageContent'

export const metadata: Metadata = {
  title: 'Cultural Makers — Sanaa Through My Lens',
  description: 'The artists, musicians, filmmakers, and creatives shaping East Africa\'s cultural landscape.',
}

export default async function MakersPage() {
  const makers = await db.maker.findMany({
    orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
  })

  return <MakersPageContent makers={JSON.parse(JSON.stringify(makers))} />
}
