'use client'

import { useStore } from '@/store/useStore'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Mail, ArrowRight } from 'lucide-react'

export function AboutPage() {
  const { categories, authors, setView } = useStore()

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-8">
        <button onClick={() => useStore.getState().goHome()} className="hover:text-foreground">Home</button>
        <span>/</span>
        <span>About</span>
      </nav>

      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">About Sanaa Through My Lens</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          An arts &amp; culture opinion blog highlighting stories around the art scene in Kenya and East Africa — music, film, book reviews, commentary, events, and infortainment.
        </p>
      </div>

      {/* What We Cover */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl font-bold mb-6">What We Cover</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { useStore.getState().setActiveCategory(cat.slug) }}
              className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors text-left group"
            >
              <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + '15' }}>
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-semibold text-sm group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{cat.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          ))}
        </div>
      </section>

      <Separator className="my-10" />

      {/* Our Mission */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl font-bold mb-6">Our Mission</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Sanaa Through My Lens was founded with a clear purpose: to amplify East African voices in arts and culture. In a media landscape where African stories are often told through external lenses, we believe in the power of opinionated, first-hand perspectives from within the region.
          </p>
          <p>
            We cover the full spectrum of the creative economy — from the music pulsing through Nairobi&rsquo;s clubs to the visual art redefining gallery spaces, from the theatre challenging social norms to the books reshaping literary canons. Our focus is not neutral reporting; it&rsquo;s informed opinion, critical commentary, and cultural analysis.
          </p>
          <p>
            East Africa&rsquo;s creative scene is exploding. A new generation of artists, musicians, writers, filmmakers, and performers is redefining what it means to be African in the 21st century. We&rsquo;re here to document that explosion, to celebrate its highs, to critique its failures, and to push the conversation forward.
          </p>
        </div>
      </section>

      <Separator className="my-10" />

      {/* The Team */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl font-bold mb-6">The Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {authors.map(author => (
            <div
              key={author.id}
              className="p-6 rounded-xl border border-border bg-card"
            >
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-bold text-base">{author.name}</h3>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-primary mb-2">{author.role}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{author.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-10" />

      {/* Get In Touch */}
      <section>
        <h2 className="font-serif text-2xl font-bold mb-6">Get In Touch</h2>
        <div className="p-6 rounded-xl bg-secondary/30 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Email Us</p>
              <a href="mailto:hello@sanaathrumylens.co.ke" className="text-primary text-sm hover:underline">
                hello@sanaathrumylens.co.ke
              </a>
            </div>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Pitch a story:</strong> Have a story idea, review, or opinion piece? We&rsquo;d love to hear from you. Send us a brief pitch (150 words max) with your angle and why it matters now.
            </p>
            <p>
              <strong className="text-foreground">Advertise:</strong> Interested in reaching our engaged audience of East African arts and culture enthusiasts? Get in touch for our media kit and rates.
            </p>
            <p>
              <strong className="text-foreground">Collaborate:</strong> We&rsquo;re open to partnerships with cultural organisations, festivals, and brands that align with our mission.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
