import type { Metadata } from 'next'
import { Header } from '@/components/sanaa/Header'
import { Footer } from '@/components/sanaa/Footer'
import { PrivacyContent } from './PrivacyContent'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Sanaa Through My Lens — how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <PrivacyContent />
      </main>
      <Footer />
    </div>
  )
}
