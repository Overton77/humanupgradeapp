import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

/**
 * Standard top-of-page header for any public entity detail.
 *
 * Layout (per docs/04 §2):
 *   - breadcrumb back link (top)
 *   - kicker (entity type badge)
 *   - title
 *   - subtitle / meta
 *   - action row (Save / Share / Ask Assistant — all wired in M1+)
 */
export function EntityHeader({
  kicker,
  title,
  subtitle,
  meta,
  actions,
  backHref,
  backLabel = 'Back',
}: {
  kicker: string
  title: string
  subtitle?: string | null
  meta?: React.ReactNode
  actions?: React.ReactNode
  backHref?: string
  backLabel?: string
}) {
  return (
    <header className="space-y-3 pb-4">
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeftIcon className="size-3.5" aria-hidden />
          {backLabel}
        </Link>
      ) : null}

      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="uppercase tracking-wide text-[10px]">
          {kicker}
        </Badge>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-balance">{title}</h1>

      {subtitle ? <p className="text-base text-muted-foreground max-w-3xl">{subtitle}</p> : null}

      {meta ? <div className="text-sm text-muted-foreground">{meta}</div> : null}

      {actions ? (
        <>
          <Separator className="my-3" />
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        </>
      ) : null}
    </header>
  )
}
