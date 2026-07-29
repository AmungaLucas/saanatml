'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, Mail } from 'lucide-react'

export function NewsletterCTA({ variant = 'inline' }: { variant?: 'inline' | 'hero' }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || '', email }),
      })
      if (res.ok) {
        setStatus('success')
        setName('')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className={`rounded-2xl p-8 md:p-12 text-center ${variant === 'hero' ? 'bg-primary text-primary-foreground' : 'bg-primary/5 border border-primary/20'}`}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Check className="h-5 w-5" />
          <span className="font-serif text-xl font-bold">You&rsquo;re subscribed!</span>
        </div>
        <p className="text-sm opacity-80 max-w-md mx-auto">
          Welcome to the Sanaa community. Look out for our next edition in your inbox.
        </p>
      </div>
    )
  }

  if (variant === 'hero') {
    return (
      <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center">
        <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">This Week in East African Arts</h2>
        <p className="text-primary-foreground/80 max-w-lg mx-auto mb-6 text-sm md:text-base">
          Get our weekly newsletter with curated event picks, new reviews, and exclusive content from the East African art scene.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            placeholder="Your name (optional)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary-foreground/50"
          />
          <input
            placeholder="Your email address"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary-foreground/50"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-2.5 rounded-lg bg-primary-foreground text-primary font-mono text-xs font-semibold hover:bg-primary-foreground/90 transition-colors shrink-0 disabled:opacity-50"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="mt-12 p-6 rounded-xl bg-primary/5 border border-primary/20">
      <h3 className="font-serif font-bold text-lg mb-2 flex items-center gap-2">
        <Mail className="h-4 w-4 text-primary" />
        Enjoyed this story?
      </h3>
      <p className="text-sm text-muted-foreground mb-4">Get more like this delivered to your inbox every week.</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Your name (optional)"
          value={name}
          onChange={e => setName(e.target.value)}
          className="max-w-[200px] h-9 text-sm"
        />
        <Input
          placeholder="Your email address"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 h-9 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          disabled={status === 'loading'}
          className="bg-primary text-primary-foreground h-9 px-4 text-xs font-mono"
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </Button>
      </form>
      {status === 'error' && (
        <p className="text-xs text-destructive mt-2">Something went wrong. Please try again.</p>
      )}
    </div>
  )
}
