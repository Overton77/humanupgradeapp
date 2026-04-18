import { Skeleton } from '@/components/ui/skeleton'
import { EntityPageShell } from '@/components/entity/EntityPageShell'

/**
 * Shared loading skeleton for any public entity detail page.
 * Mirrors the EntityPageShell layout so the layout shift is minimal.
 */
export function EntityPageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <EntityPageShell
      main={
        <div className="space-y-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2 pt-4">
            {Array.from({ length: rows }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </div>
      }
      rail={
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      }
    />
  )
}
