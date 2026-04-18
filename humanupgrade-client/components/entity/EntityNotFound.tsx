import Link from 'next/link'
import { SearchXIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Shared "no such entity" view. Used by detail pages when the GraphQL
 * `findUnique` returns null. Better UX than Next's stock 404 because it
 * keeps the user inside the marketing layout + offers a way forward.
 */
export function EntityNotFound({
  kind,
  identifier,
}: {
  kind: string
  identifier: string
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="mx-auto rounded-full border border-dashed border-border w-12 h-12 flex items-center justify-center text-muted-foreground mb-4">
        <SearchXIcon className="size-5" aria-hidden />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{kind} not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We couldn&apos;t find a {kind.toLowerCase()} matching{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{identifier}</code>.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Button variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
        <Button asChild>
          <Link href="/search">Search</Link>
        </Button>
      </div>
    </div>
  )
}
