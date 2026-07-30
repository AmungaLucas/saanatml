import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { EventsContent } from './EventsContent'

export const metadata: Metadata = {
  title: 'Events — Sanaa Through My Lens',
  description: 'Art exhibitions, festivals, concerts, launches and cultural happenings in Kenya and East Africa.',
}

export default async function EventsPageRoute() {
  const events = await db.event.findMany({
    orderBy: [{ isPast: 'asc' }, { date: 'asc' }],
    include: { categoryRef: true },
  })

  return <EventsContent events={JSON.parse(JSON.stringify(events))} />
}
