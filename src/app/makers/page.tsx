import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { MakersPageContent } from './MakersPageContent'
import { Header } from '@/components/sanaa/Header'
import { Footer } from '@/components/sanaa/Footer'
import { MakerModal } from '@/components/sanaa/MakerModal'

export const metadata: Metadata = {
  title: 'Cultural Makers — Sanaa Through My Lens',
  description: 'The artists, musicians, filmmakers, and creatives shaping East Africa\'s cultural landscape.',
}

export default async function MakersPage() {
  let makers: any[] = []
  try {
    makers = await db.maker.findMany({
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
    })
  } catch {
    // Show page with empty makers list on DB failure
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <MakersPageContent makers={JSON.parse(JSON.stringify(makers))} />
      </main>
      <Footer />
      <MakerModal />
    </div>
  )
}
