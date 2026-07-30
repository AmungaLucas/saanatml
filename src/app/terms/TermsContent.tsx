'use client'

import Link from 'next/link'
import { ScrollReveal } from '@/components/sanaa/ScrollReveal'

export function TermsContent() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12 animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span>Terms of Service</span>
      </nav>

      <ScrollReveal>
        <h1 className="font-serif text-2xl md:text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          Effective Date: <span className="font-semibold text-foreground">July 2025</span>
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <section className="mb-10">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Welcome to Sanaa Through My Lens. These Terms of Service (&ldquo;Terms&rdquo;) govern your use of our website at <a href="https://sanaathrumylens.co.ke" className="text-primary hover:underline">sanaathrumylens.co.ke</a>. By accessing or using our website, you agree to be bound by these Terms. If you do not agree, please do not use our website.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">1. Acceptance of Terms</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            By accessing, browsing, or using the Sanaa Through My Lens website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service, as well as our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> and <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link>. These terms apply to all visitors, users, and others who access or use the website.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website following any changes constitutes your acceptance of the revised Terms.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">2. User Content and Comments</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Our website may allow you to post comments and other content. By submitting content to our website, you grant us a non-exclusive, worldwide, royalty-free licence to use, reproduce, modify, and display your content in connection with the operation of the website.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            You are solely responsible for the content you submit. You agree not to post content that:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Is defamatory, obscene, offensive, or otherwise objectionable</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Infringes on the intellectual property rights of any third party</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Contains hate speech, discrimination, or incitement to violence</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Constitutes spam, advertising, or unauthorised solicitation</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Contains personal information of others without their consent</li>
            <li className="text-sm text-muted-foreground leading-relaxed ml-4 list-disc">Violates any applicable law or regulation</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We reserve the right to remove, edit, or refuse to display any user content at our sole discretion, without notice.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.25}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">3. Intellectual Property</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            All content on the Sanaa Through My Lens website &mdash; including but not limited to articles, reviews, commentary, photography, graphics, logos, design elements, and the overall look and feel &mdash; is the property of Sanaa Through My Lens or its content creators and is protected by applicable intellectual property laws.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            You may not reproduce, distribute, modify, create derivative works from, publicly display, or commercially exploit any content from this website without our prior written consent. Sharing links to our articles on social media or other platforms is encouraged and permitted.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            The &ldquo;Sanaa Through My Lens&rdquo; name and logo are trademarks and may not be used without our express written permission.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.3}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">4. Disclaimer</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            The content published on Sanaa Through My Lens represents the opinions and views of the authors. It is provided for informational and entertainment purposes only. While we strive for accuracy, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on the website.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            The views expressed in articles, reviews, and commentary are those of the individual authors and do not necessarily reflect the views of Sanaa Through My Lens as a publication. Information about events, exhibitions, and cultural happenings is subject to change; we recommend verifying details with the relevant organisers.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.35}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">5. Limitation of Liability</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            To the fullest extent permitted by applicable law, Sanaa Through My Lens, its editors, contributors, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the website or its content. This includes, but is not limited to, damages for loss of profits, data, goodwill, or other intangible losses.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We are not responsible for the content, accuracy, or opinions expressed on external websites that may be linked from our website. Links to third-party websites do not constitute an endorsement by Sanaa Through My Lens.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.4}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">6. Indemnification</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            You agree to indemnify and hold harmless Sanaa Through My Lens, its editors, contributors, and affiliates from and against any claims, damages, losses, liabilities, and expenses arising from your use of the website or your violation of these Terms.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.45}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">7. Governing Law</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of Kenya. Any disputes arising from or relating to these Terms or your use of the website shall be subject to the exclusive jurisdiction of the courts of Kenya.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.5}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">8. Termination</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We reserve the right to restrict or terminate your access to the website at any time, without notice or liability, for any reason, including but not limited to a breach of these Terms.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.55}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">9. Severability</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            If any provision of these Terms is found to be invalid or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The invalid or unenforceable provision shall be replaced by a valid provision that most closely reflects the intent of the original.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.6}>
        <section className="mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">10. Contact Us</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <div className="p-6 rounded-xl bg-secondary/30 border border-border">
            <p className="text-sm font-medium mb-1">Sanaa Through My Lens</p>
            <p className="text-sm text-muted-foreground mb-1">
              Legal: <a href="mailto:legal@sanaathrumylens.co.ke" className="text-primary hover:underline">legal@sanaathrumylens.co.ke</a>
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
