'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-12 w-12 text-amber-500/60 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {error.message || 'An unexpected error occurred while loading this page.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset} variant="outline">
            Try Again
          </Button>
          <Button onClick={() => (window.location.href = '/')}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
