import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildIndexHref } from '@/lib/entity-index/params'
import type { EntityIndexParams } from '@/lib/entity-index/types'

/**
 * Two-button pagination + small page indicator. Pure server component.
 *
 * Doesn't render numbered pages — total counts can be in the millions,
 * and we already show "X of N total" in the header. Prev/Next is enough
 * for a long-tail browse.
 */
export function EntityIndexPagination({
  current,
  pathname,
  total,
}: {
  current: EntityIndexParams
  pathname: string
  total: number
}) {
  const totalPages = Math.max(1, Math.ceil(total / current.pageSize))
  if (totalPages <= 1) return null

  const prev = current.page > 1 ? buildIndexHref(pathname, current, { page: current.page - 1 }) : null
  const next = current.page < totalPages ? buildIndexHref(pathname, current, { page: current.page + 1 }) : null

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-3">
      <div className="text-xs text-muted-foreground">
        Page {current.page} of {totalPages.toLocaleString()}
      </div>
      <div className="flex items-center gap-2">
        <Button asChild={Boolean(prev)} variant="outline" size="sm" disabled={!prev}>
          {prev ? (
            <Link href={prev} aria-label="Previous page">
              <ChevronLeftIcon className="size-4" /> Previous
            </Link>
          ) : (
            <span>
              <ChevronLeftIcon className="size-4" /> Previous
            </span>
          )}
        </Button>
        <Button asChild={Boolean(next)} variant="outline" size="sm" disabled={!next}>
          {next ? (
            <Link href={next} aria-label="Next page">
              Next <ChevronRightIcon className="size-4" />
            </Link>
          ) : (
            <span>
              Next <ChevronRightIcon className="size-4" />
            </span>
          )}
        </Button>
      </div>
    </nav>
  )
}
