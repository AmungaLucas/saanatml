import type { Metadata } from 'next'
import { Header } from '@/components/sanaa/Header'
import { Footer } from '@/components/sanaa/Footer'
import { TermsContent } from './TermsContent'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Sanaa Through My Lens — rules and guidelines for using our website.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <TermsContent />
      </main>
      <Footer />
    </div>
  )
}
