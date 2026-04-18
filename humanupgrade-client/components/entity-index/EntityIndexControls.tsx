import { SearchInTypeInput } from '@/components/entity-index/SearchInTypeInput'
import { FilterBar } from '@/components/entity-index/FilterBar'
import type { EntityIndexParams, FilterSpec } from '@/lib/entity-index/types'

/**
 * Controls row: search input + filter pills + result-count summary.
 *
 * Composed inside <EntityIndexShell controls={...} />.
 */
export function EntityIndexControls({
  current,
  filters,
  searchPlaceholder,
  total,
}: {
  current: EntityIndexParams
  filters: FilterSpec[]
  searchPlaceholder: string
  total: number | null
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <SearchInTypeInput current={current} placeholder={searchPlaceholder} />
        {total != null ? (
          <span className="text-xs text-muted-foreground">
            {total.toLocaleString()} total
          </span>
        ) : null}
      </div>
      <FilterBar current={current} filters={filters} />
    </div>
  )
}
