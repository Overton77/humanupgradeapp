import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * Visually-uniform card used by every /e/<type> index grid.
 *
 * Sub-components are intentionally decomposed so callers can plug in
 * type-specific bits (e.g. duration badge for episodes, score for compounds)
 * without forking the layout.
 */
export function EntityIndexCard({
  href,
  title,
  description,
  meta,
  badges,
  children,
}: {
  href: string
  title: string
  description?: string | null
  /** Right-aligned single-line meta (e.g. duration, date). */
  meta?: React.ReactNode
  /** Small inline badges below the title. */
  badges?: { label: string; variant?: 'default' | 'secondary' | 'outline' }[]
  /** Optional extra row at the card bottom (e.g. relation chips). */
  children?: React.ReactNode
}) {
  return (
    <Link href={href} className="group block focus:outline-none focus:ring-2 focus:ring-ring rounded-lg">
      <Card className="h-full transition-colors group-hover:border-foreground/40">
        <CardHeader className="space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base leading-snug line-clamp-2">{title}</CardTitle>
            {meta ? <span className="shrink-0 text-xs text-muted-foreground">{meta}</span> : null}
          </div>
          {description ? (
            <CardDescription className="line-clamp-3">{description}</CardDescription>
          ) : null}
        </CardHeader>

        {(badges?.length ?? 0) > 0 || children ? (
          <CardContent className="space-y-2">
            {(badges?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-1">
                {badges!.map((b) => (
                  <Badge key={b.label} variant={b.variant ?? 'secondary'} className="text-[10px]">
                    {b.label}
                  </Badge>
                ))}
              </div>
            ) : null}
            {children}
          </CardContent>
        ) : null}
      </Card>
    </Link>
  )
}

/** Standard grid wrapper around the cards. */
export function EntityIndexGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}

/** Empty state when a query+filter combo returns no items. */
export function EntityIndexEmpty({
  hasQueryOrFilter,
  kindPlural,
}: {
  hasQueryOrFilter: boolean
  kindPlural: string
}) {
  return (
    <div className="rounded-lg border border-dashed border-border py-16 text-center">
      <p className="text-sm text-muted-foreground">
        {hasQueryOrFilter
          ? `No ${kindPlural} match the current search and filters.`
          : `No ${kindPlural} found yet. Check back as the knowledge graph grows.`}
      </p>
    </div>
  )
}
