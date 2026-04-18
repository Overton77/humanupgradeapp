'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { buildIndexHref } from '@/lib/entity-index/params'
import type { EntityIndexParams, FilterSpec } from '@/lib/entity-index/types'

/**
 * Render a row of filter controls based on the entity's FilterSpec[].
 *
 * Booleans render as toggle pills ("Published only" / active = filled).
 * Enums render as a label + a row of option pills.
 *
 * Every interaction is a Link — no client state — so the URL stays the
 * single source of truth and nothing breaks server-side rendering.
 */
export function FilterBar({
  current,
  filters,
}: {
  current: EntityIndexParams
  filters: FilterSpec[]
}) {
  const pathname = usePathname() ?? ''

  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {filters.map((f) =>
        f.kind === 'boolean' ? (
          <BooleanFilterToggle key={f.param} spec={f} current={current} pathname={pathname} />
        ) : (
          <EnumFilterPills key={f.param} spec={f} current={current} pathname={pathname} />
        ),
      )}

      {hasAnyActiveFilter(current, filters) ? (
        <Link
          href={buildIndexHref(pathname, current, {
            page: 1,
            filters: Object.fromEntries(filters.map((f) => [f.param, null])),
          })}
        >
          <Badge variant="ghost" className="cursor-pointer underline underline-offset-2 text-xs">
            Clear filters
          </Badge>
        </Link>
      ) : null}
    </div>
  )
}

function hasAnyActiveFilter(current: EntityIndexParams, filters: FilterSpec[]): boolean {
  return filters.some((f) => Boolean(current.filters[f.param]))
}

function BooleanFilterToggle({
  spec,
  current,
  pathname,
}: {
  spec: Extract<FilterSpec, { kind: 'boolean' }>
  current: EntityIndexParams
  pathname: string
}) {
  const active = current.filters[spec.param] === 'true'
  const next = active ? null : 'true'
  const href = buildIndexHref(pathname, current, {
    page: 1,
    filters: { [spec.param]: next },
  })
  return (
    <Link href={href}>
      <Badge variant={active ? 'default' : 'outline'} className="cursor-pointer">
        {spec.label}
      </Badge>
    </Link>
  )
}

function EnumFilterPills({
  spec,
  current,
  pathname,
}: {
  spec: Extract<FilterSpec, { kind: 'enum' }>
  current: EntityIndexParams
  pathname: string
}) {
  const active = current.filters[spec.param]
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{spec.label}:</span>
      <Link href={buildIndexHref(pathname, current, { page: 1, filters: { [spec.param]: null } })}>
        <Badge variant={active == null ? 'default' : 'outline'} className="cursor-pointer">
          All
        </Badge>
      </Link>
      {spec.options.map((opt) => {
        const isActive = active === opt.value
        const next = isActive ? null : opt.value
        return (
          <Link
            key={opt.value}
            href={buildIndexHref(pathname, current, { page: 1, filters: { [spec.param]: next } })}
          >
            <Badge variant={isActive ? 'default' : 'outline'} className="cursor-pointer">
              {opt.label}
            </Badge>
          </Link>
        )
      })}
    </div>
  )
}
