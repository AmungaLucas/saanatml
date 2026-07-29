'use client'

import { useStore } from '@/store/useStore'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  const { categories, setActiveCategory } = useStore()

  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <span className="font-serif text-xl font-bold">SANAATHRUMYLENS</span>
            <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase mt-1">
              Art Through My Lens
            </p>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              An arts &amp; culture opinion blog highlighting stories around the art scene in Kenya and East Africa — music, film, book reviews, commentary, events, and infortainment.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Categories
            </h4>
            <ul className="space-y-2">
              {categories.map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => setActiveCategory(c.slug)}
                    className="text-sm text-foreground/70 hover:text-primary transition-colors"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {['About Us', 'Events', 'Newsletter', 'Advertise with Us', 'Search'].map(link => (
                <li key={link}>
                  <button className="text-sm text-foreground/70 hover:text-primary transition-colors">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              This Week in EA Arts
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Subscribe to our weekly newsletter.
            </p>
            <button className="text-sm text-primary hover:underline font-medium">
              Subscribe &rarr;
            </button>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Sanaa Through My Lens. All rights reserved.</p>
          <p className="font-mono">
            Arts &amp; Culture Opinion Blog — Kenya &amp; East Africa
          </p>
        </div>
      </div>
    </footer>
  )
}
