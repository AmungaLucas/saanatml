'use client'

import Link from 'next/link'
import { ScrollReveal } from '@/components/sanaa/ScrollReveal'
import { AdPlaceholder } from '@/components/sanaa/AdPlaceholder'

export function AdvertiseContent() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12 animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span>Advertise</span>
      </nav>

      <ScrollReveal>
        <h1 className="font-serif text-2xl md:text-3xl font-bold mb-4">Advertise With Us</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          Reach a passionate, engaged audience of arts and culture enthusiasts across Kenya and East Africa.
        </p>
      </ScrollReveal>

      {/* Why Advertise */}
      <ScrollReveal delay={0.1}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">Why Advertise With Sanaa Through My Lens?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Sanaa Through My Lens is the go-to opinion blog for the arts and culture scene in Kenya and East Africa. Our readers are culturally engaged, creative professionals, event-goers, and tastemakers who actively seek out new experiences, products, and ideas.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl border border-border bg-secondary/20 text-center">
              <p className="font-serif text-2xl font-bold text-primary mb-1">Kenya</p>
              <p className="text-xs text-muted-foreground">Primary market</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-secondary/20 text-center">
              <p className="font-serif text-2xl font-bold text-primary mb-1">East Africa</p>
              <p className="text-xs text-muted-foreground">Regional reach</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-secondary/20 text-center">
              <p className="font-serif text-2xl font-bold text-primary mb-1">Arts &amp; Culture</p>
              <p className="text-xs text-muted-foreground">Niche focus</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our audience trusts us for thoughtful, opinionated coverage of music, film, visual arts, theatre, literature, and cultural events. Advertising with us means your brand is associated with quality, authenticity, and cultural relevance.
          </p>
        </section>
      </ScrollReveal>

      {/* Our Audience */}
      <ScrollReveal delay={0.15}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">Our Audience</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Our readers include:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Creative professionals &mdash; artists, musicians, filmmakers, writers, designers</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Cultural enthusiasts &mdash; gallery-goers, festival attendees, theatre lovers</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Industry stakeholders &mdash; arts organisations, festival organisers, curators</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Young professionals &mdash; urban, digitally savvy, trend-conscious consumers</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Diaspora community &mdash; East Africans abroad seeking cultural connection</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our content covers categories including music, film, visual arts, theatre, books and literature, fashion, photography, and cultural commentary &mdash; giving advertisers the opportunity to target specific cultural niches.
          </p>
        </section>
      </ScrollReveal>

      {/* Ad Formats */}
      <ScrollReveal delay={0.2}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">Ad Formats</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            We offer several advertising formats to suit your goals and budget:
          </p>

          <h3 className="font-serif text-lg font-semibold mt-8 mb-3">Banner Ads</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Full-width banner placements at the top and bottom of article pages. Banner ads provide maximum visibility and are ideal for brand awareness campaigns.
          </p>
          <div className="mb-6">
            <AdPlaceholder variant="banner" />
          </div>
          <ul className="space-y-2 mb-6">
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Dimensions: 728 x 90 pixels (leaderboard)</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Placement: Above or below article content</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Static and animated formats accepted</li>
          </ul>

          <h3 className="font-serif text-lg font-semibold mt-8 mb-3">Sidebar Ads</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Medium rectangle placements in the sidebar alongside article content. Sidebar ads are persistent and visible as readers scroll through articles.
          </p>
          <div className="flex justify-start mb-6">
            <AdPlaceholder variant="sidebar" />
          </div>
          <ul className="space-y-2 mb-6">
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Dimensions: 300 x 250 pixels (medium rectangle)</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Placement: Right sidebar on article pages</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Static and animated formats accepted</li>
          </ul>

          <h3 className="font-serif text-lg font-semibold mt-8 mb-3">Sponsored Content</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Native content integrations that align with our editorial voice. Sponsored articles are clearly labelled and provide a genuine, engaging way to connect with our audience.
          </p>
          <div className="mb-6">
            <AdPlaceholder variant="in-feed" />
          </div>
          <ul className="space-y-2 mb-6">
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Full article or feature-length sponsored content</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Clearly marked as &ldquo;Sponsored&rdquo; for transparency</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Written by our editorial team in collaboration with your brand</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Shared across our social media channels</li>
          </ul>
        </section>
      </ScrollReveal>

      {/* Media Kit */}
      <ScrollReveal delay={0.25}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">Media Kit</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            For detailed information about our audience demographics, traffic statistics, pricing, and available placements, download our media kit.
          </p>
          <div className="p-6 rounded-xl bg-secondary/30 border border-border text-center">
            <p className="text-sm text-muted-foreground mb-1">Media Kit coming soon</p>
            <p className="text-xs text-muted-foreground/60">
              Contact us at <a href="mailto:ads@sanaathrumylens.co.ke" className="text-primary hover:underline">ads@sanaathrumylens.co.ke</a> to request our media kit and rate card
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* Guidelines */}
      <ScrollReveal delay={0.3}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">Advertising Guidelines</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We reserve the right to decline advertising that does not align with our editorial values. We do not accept advertisements for:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Products or services that are illegal, harmful, or deceptive</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Adult content or sexually suggestive material</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Political campaigns or partisan political messaging</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Content that is discriminatory, hateful, or offensive</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Misleading health, financial, or legal claims</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All advertisements must be clearly distinguishable from editorial content. We believe in transparency with our readers.
          </p>
        </section>
      </ScrollReveal>

      {/* Contact */}
      <ScrollReveal delay={0.35}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">Get In Touch</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Ready to reach our audience? We would love to hear from you. Whether you have a specific campaign in mind or need guidance on the best approach for your brand, our team is here to help.
          </p>
          <div className="p-6 rounded-xl bg-secondary/30 border border-border">
            <p className="text-sm font-medium mb-1">Sanaa Through My Lens &mdash; Advertising</p>
            <p className="text-sm text-muted-foreground mb-1">
              Email: <a href="mailto:ads@sanaathrumylens.co.ke" className="text-primary hover:underline">ads@sanaathrumylens.co.ke</a>
            </p>
            <p className="text-sm text-muted-foreground mb-1">
              General: <a href="mailto:hello@sanaathrumylens.co.ke" className="text-primary hover:underline">hello@sanaathrumylens.co.ke</a>
            </p>
            <p className="text-sm text-muted-foreground">
              Website: <a href="https://sanaathrumylens.co.ke" className="text-primary hover:underline">sanaathrumylens.co.ke</a>
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* Related */}
      <ScrollReveal delay={0.4}>
        <section className="mb-10">
          <p className="text-sm text-muted-foreground">
            Related: <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> &middot; <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> &middot; <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link>
          </p>
        </section>
      </ScrollReveal>
    </div>
  )
}
