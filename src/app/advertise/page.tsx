import type { Metadata } from 'next'
import { Header } from '@/components/sanaa/Header'
import { Footer } from '@/components/sanaa/Footer'
import { AdvertiseContent } from './AdvertiseContent'

export const metadata: Metadata = {
  title: 'Advertise With Us',
  description: 'Advertise with Sanaa Through My Lens — reach a passionate audience of arts and culture enthusiasts across Kenya and East Africa.',
}

export default function AdvertisePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <AdvertiseContent />
      </main>
      <Footer />
    </div>
  )
}
