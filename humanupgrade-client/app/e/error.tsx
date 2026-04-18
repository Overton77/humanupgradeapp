'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/marketing/SiteHeader'
import { SiteFooter } from '@/components/marketing/SiteFooter'

/**
 * Error boundary for any entity page under /e/. Triggered when a query
 * throws (network error, schema mismatch, etc).
 *
 * Distinct from EntityNotFound (which is rendered when the query succeeds
 * with `null`).
 */
export default function EntityErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t load this entity. The API may be temporarily unavailable.
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-muted-foreground font-mono">id: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" onClick={() => reset()}>
            Try again
          </Button>
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
