import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { EventsContent } from './EventsContent'
import { EventModal } from '@/components/sanaa/EventModal'
import { Header } from '@/components/sanaa/Header'
import { Footer } from '@/components/sanaa/Footer'

export const metadata: Metadata = {
  title: 'Events — Sanaa Through My Lens',
  description: 'Art exhibitions, festivals, concerts, launches and cultural happenings in Kenya and East Africa.',
}

export default async function EventsPageRoute() {
  let events: any[] = []
  try {
    events = await db.event.findMany({
      orderBy: [{ isPast: 'asc' }, { date: 'asc' }],
      include: { categoryRef: true },
    })
  } catch {
    // Show page with empty events list on DB failure
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <EventsContent events={JSON.parse(JSON.stringify(events))} />
      </main>
      <Footer />
      <EventModal />
    </div>
  )
}
