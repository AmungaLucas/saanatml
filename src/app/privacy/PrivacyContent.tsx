'use client'

import Link from 'next/link'
import { ScrollReveal } from '@/components/sanaa/ScrollReveal'

export function PrivacyContent() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12 animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span>Privacy Policy</span>
      </nav>

      <ScrollReveal>
        <h1 className="font-serif text-2xl md:text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          Effective Date: <span className="font-semibold text-foreground">July 2025</span>
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <section className="mb-10">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            At Sanaa Through My Lens (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at <a href="https://sanaathrumylens.co.ke" className="text-primary hover:underline">sanaathrumylens.co.ke</a>. Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">1. Information We Collect</h2>

          <h3 className="font-serif text-lg font-semibold mt-8 mb-3">Personal Information</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We may collect personal information that you voluntarily provide to us when you:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Subscribe to our newsletter — we collect your name and email address</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Leave a comment on an article — your name and comment text are stored</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Contact us via email — your name, email, and message content</li>
          </ul>

          <h3 className="font-serif text-lg font-semibold mt-8 mb-3">Automatically Collected Information</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            When you visit our website, we may automatically collect certain information about your device, including:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Browser type and version</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Operating system</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Referring URLs</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Pages visited and time spent on each page</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Date and time of your visit</li>
          </ul>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">2. How We Use Your Information</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We use the information we collect for the following purposes:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">To deliver and manage newsletter subscriptions you have requested</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">To display and moderate user comments on articles</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">To analyse website traffic and usage patterns to improve our content</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">To respond to your inquiries and requests</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">To ensure the security and integrity of our website</li>
          </ul>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.25}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">3. Cookies and Local Storage</h2>

          <h3 className="font-serif text-lg font-semibold mt-8 mb-3">Cookies</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We use a small number of cookies to enhance your experience. Cookies are small text files placed on your device that help us remember your preferences and understand how you use our site.
          </p>

          <h3 className="font-serif text-lg font-semibold mt-8 mb-3">Local Storage</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We use your browser&rsquo;s local storage to store the following data locally on your device:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc"><strong className="text-foreground">Theme preference</strong> — your choice of light or dark mode</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc"><strong className="text-foreground">Reading history</strong> — articles you have read and your progress</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc"><strong className="text-foreground">Bookmarks</strong> — articles you have saved for later</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc"><strong className="text-foreground">Likes</strong> — articles you have liked</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc"><strong className="text-foreground">Recent searches</strong> — search queries you have entered</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            This data never leaves your browser and is not transmitted to our servers. You can clear this data at any time through your browser settings.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.3}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">4. Third-Party Services</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We may use third-party services to help us analyse website traffic and improve your experience. These services may collect information about your browsing activity across different websites. Currently, we do not use any third-party analytics or tracking services, but we may introduce them in the future. If we do, we will update this policy accordingly and provide appropriate disclosures.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.35}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">5. Data Sharing and Disclosure</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">With your consent, when you have given us explicit permission to share your data</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">To comply with legal obligations, court orders, or applicable laws</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">To protect our rights, privacy, safety, or property, or that of our users or the public</li>
          </ul>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.4}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">6. Your Data Rights</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            You have the right to:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc"><strong className="text-foreground">Access</strong> — request a copy of the personal data we hold about you</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc"><strong className="text-foreground">Correction</strong> — request correction of any inaccurate or incomplete personal data</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc"><strong className="text-foreground">Deletion</strong> — request deletion of your personal data from our systems</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc"><strong className="text-foreground">Unsubscribe</strong> — unsubscribe from our newsletter at any time using the link provided in each email</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc"><strong className="text-foreground">Data portability</strong> — request your data in a structured, commonly used format</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            To exercise any of these rights, please contact us at <a href="mailto:privacy@sanaathrumylens.co.ke" className="text-primary hover:underline">privacy@sanaathrumylens.co.ke</a>.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.45}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">7. Data Security</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We implement reasonable technical and organisational measures to protect your personal information from unauthorised access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.5}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">8. Children&rsquo;s Privacy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can take appropriate action.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.55}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">9. Changes to This Policy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We may update this Privacy Policy from time to time. When we do, we will revise the &ldquo;Effective Date&rdquo; at the top of this page. We encourage you to review this policy periodically to stay informed about how we protect your information.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.6}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">10. Contact Us</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
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

      <ScrollReveal delay={0.65}>
        <div className="mt-10 pt-6 border-t border-border">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 text-center">
            Last updated: July 2025
          </p>
        </div>
      </ScrollReveal>
    </div>
  )
}
