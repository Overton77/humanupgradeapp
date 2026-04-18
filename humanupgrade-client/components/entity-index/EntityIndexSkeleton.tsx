import { Skeleton } from '@/components/ui/skeleton'
import { SiteHeader } from '@/components/marketing/SiteHeader'
import { SiteFooter } from '@/components/marketing/SiteFooter'

/** Loading skeleton mirroring EntityIndexShell to minimize layout shift. */
export function EntityIndexSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="space-y-2 mb-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="border-b border-border py-3 mb-6 flex items-center gap-3">
            <Skeleton className="h-9 w-72" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: cards }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
