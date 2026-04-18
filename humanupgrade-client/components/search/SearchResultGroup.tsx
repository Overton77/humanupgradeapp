import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

/**
 * One bucket of results inside the global search dialog or the /search page.
 * Generic over result-row shape; the parent passes a render function.
 *
 * Hidden when `total === 0` to keep the dialog tight on narrow queries.
 */
export function SearchResultGroup<TItem>({
  label,
  total,
  items,
  emptyHint,
  renderItem,
  seeAllHref,
}: {
  label: string
  total: number
  items: TItem[]
  emptyHint?: React.ReactNode
  renderItem: (item: TItem, i: number) => React.ReactNode
  seeAllHref?: string
}) {
  if (total === 0 && (items?.length ?? 0) === 0) {
    if (!emptyHint) return null
    return (
      <section className="space-y-2">
        <SectionHeader label={label} total={0} />
        <p className="text-xs text-muted-foreground italic">{emptyHint}</p>
      </section>
    )
  }
  return (
    <section className="space-y-2">
      <SectionHeader label={label} total={total} seeAllHref={seeAllHref} />
      <ul className="divide-y divide-border rounded-md border border-border bg-card">
        {items.map(renderItem)}
      </ul>
    </section>
  )
}

function SectionHeader({
  label,
  total,
  seeAllHref,
}: {
  label: string
  total: number
  seeAllHref?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</h3>
        <Badge variant="outline" className="text-[10px]">{total}</Badge>
      </div>
      {seeAllHref ? (
        <Link href={seeAllHref} className="text-xs text-muted-foreground hover:text-foreground">
          see all →
        </Link>
      ) : null}
    </div>
  )
}

/** Standard row layout used by all groups. */
export function SearchResultRow({
  href,
  title,
  subtitle,
  rightSlot,
}: {
  href: string
  title: string
  subtitle?: string | null
  rightSlot?: React.ReactNode
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium line-clamp-1">{title}</div>
          {subtitle ? (
            <div className="text-xs text-muted-foreground line-clamp-1">{subtitle}</div>
          ) : null}
        </div>
        {rightSlot}
      </Link>
    </li>
  )
}
