'use client'

import Link from 'next/link'
import { ScrollReveal } from '@/components/sanaa/ScrollReveal'

export function CookieContent() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12 animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span>Cookie Policy</span>
      </nav>

      <ScrollReveal>
        <h1 className="font-serif text-2xl md:text-3xl font-bold mb-6">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          Effective Date: <span className="font-semibold text-foreground">July 2025</span>
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">1. What Are Cookies?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently, to provide a better browsing experience, and to supply information to the website owners.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            This Cookie Policy explains how Sanaa Through My Lens uses cookies and similar technologies, such as local storage, when you visit our website at <a href="https://sanaathrumylens.co.ke" className="text-primary hover:underline">sanaathrumylens.co.ke</a>.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">2. Essential Cookies</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            These cookies are necessary for the website to function properly. They cannot be disabled without affecting core functionality.
          </p>
          <ul className="space-y-2 mb-6">
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc"><strong className="text-foreground">Theme preference</strong> — remembers whether you have selected light or dark mode</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc"><strong className="text-foreground">Session state</strong> — maintains your browsing session to ensure consistent behaviour</li>
          </ul>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">3. Analytics Cookies</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Analytics cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. Currently, we do not use third-party analytics cookies. However, we may introduce analytics services (such as Google Analytics or Plausible) in the future to better understand our audience and improve content.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            If we introduce analytics cookies, we will update this policy and provide you with the option to opt out.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.25}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">4. Local Storage Usage</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            In addition to cookies, we use your browser&rsquo;s local storage to enhance your experience. Local storage data is stored entirely on your device and is never transmitted to our servers. We use local storage for the following purposes:
          </p>

          <h3 className="font-serif text-lg font-semibold mt-8 mb-3">Theme Preference</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We store your selected theme (light or dark mode) so that your preference is maintained across page visits and browser sessions.
          </p>

          <h3 className="font-serif text-lg font-semibold mt-8 mb-3">Bookmarks</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            When you bookmark an article for later reading, the bookmark is stored in local storage. This allows you to access your saved articles without needing an account. All bookmark data remains on your device.
          </p>

          <h3 className="font-serif text-lg font-semibold mt-8 mb-3">Reading History</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We track which articles you have read and your reading progress (scroll position) in local storage. This enables features like &ldquo;continue reading&rdquo; and helps you pick up where you left off. Reading history is stored locally and can be cleared at any time.
          </p>

          <h3 className="font-serif text-lg font-semibold mt-8 mb-3">Likes</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            When you like an article, your like is stored in local storage. This allows us to display your liked articles and prevent duplicate likes. Like data does not leave your device.
          </p>

          <h3 className="font-serif text-lg font-semibold mt-8 mb-3">Recent Searches</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Your recent search queries are stored in local storage to provide quick access to your search history within the search modal. This data is never sent to our servers.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.3}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">5. Third-Party Cookies</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Some content on our website may embed third-party content (such as social media embeds, maps, or videos) that may set their own cookies. We do not control these third-party cookies and recommend reviewing the cookie policies of the respective providers.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Common third-party services that may set cookies include:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Social media platforms (Twitter/X, Instagram, Facebook) for embedded posts</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Video hosting platforms (YouTube, Vimeo) for embedded videos</li>
          </ul>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.35}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">6. How to Manage Cookies</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            You can control and manage cookies in several ways:
          </p>

          <h3 className="font-serif text-lg font-semibold mt-8 mb-3">Browser Settings</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Most web browsers allow you to control cookies through their settings. You can set your browser to refuse all cookies, accept only certain cookies, or alert you when a cookie is being set. Consult your browser&rsquo;s help documentation for instructions on managing cookies.
          </p>

          <h3 className="font-serif text-lg font-semibold mt-8 mb-3">Clearing Local Storage</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            You can clear all local storage data for our website by:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Using your browser&rsquo;s developer tools (F12 &rarr; Application &rarr; Local Storage)</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Clearing your browser&rsquo;s site data and cache</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Using the clear options provided within our website (e.g., clear reading history)</li>
          </ul>

          <h3 className="font-serif text-lg font-semibold mt-8 mb-3">Opt-Out Tools</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            If we introduce third-party analytics services, we will provide information about opt-out tools available from those providers.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Please note that disabling cookies or clearing local storage may affect certain features of our website, such as theme persistence, bookmarks, and reading history.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.4}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">7. Updates to This Policy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.45}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">8. Related Policies</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            For more information about how we handle your data, please also review our:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc"><Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link></li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc"><Link href="/terms" className="text-primary hover:underline">Terms of Service</Link></li>
          </ul>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.5}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">9. Contact Us</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            If you have any questions about this Cookie Policy, please contact us at:
          </p>
          <div className="p-6 rounded-xl bg-secondary/30 border border-border">
            <p className="text-sm font-medium mb-1">Sanaa Through My Lens</p>
            <p className="text-sm text-muted-foreground mb-1">
              Email: <a href="mailto:privacy@sanaathrumylens.co.ke" className="text-primary hover:underline">privacy@sanaathrumylens.co.ke</a>
            </p>
            <p className="text-sm text-muted-foreground">
              Website: <a href="https://sanaathrumylens.co.ke" className="text-primary hover:underline">sanaathrumylens.co.ke</a>
            </p>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.55}>
        <div className="mt-10 pt-6 border-t border-border">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 text-center">
            Last updated: July 2025
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
