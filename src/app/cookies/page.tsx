import type { Metadata } from 'next'
import { Header } from '@/components/sanaa/Header'
import { Footer } from '@/components/sanaa/Footer'
import { CookieContent } from './CookieContent'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Cookie Policy for Sanaa Through My Lens — what cookies and local storage we use and how to manage them.',
}

export default function CookiePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <CookieContent />
      </main>
      <Footer />
    </div>
  )
}
