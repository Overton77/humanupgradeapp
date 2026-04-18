/**
 * Shared types for the entity index pages (/e/<type>).
 *
 * The pages compose a generic <EntityIndexShell /> with per-entity bits:
 *   - the filter spec (declares which boolean / enum filters this entity supports)
 *   - the data fetcher (server-side, calls the typed list query)
 *   - the card renderer (knows how to render one item)
 *
 * Each page file is therefore small and focused on its entity's specifics.
 *
 * IMPORTANT: FilterSpec MUST be fully serializable (no functions). It crosses
 * the server→client boundary into <FilterBar /> via <EntityIndexControls />.
 * URL→API conversion lives in `params.ts` helpers (`readBooleanFilter`,
 * `readEnumFilter`) that page-level server code calls directly.
 */

/** A boolean toggle filter, e.g. "Published only". */
export type BooleanFilterSpec = {
  kind: 'boolean'
  /** URL search param key, e.g. "published". */
  param: string
  /** Visible label, e.g. "Published only". */
  label: string
}

/** An enum filter rendered as a row of pills, e.g. ClaimStance. */
export type EnumFilterSpec<TValue extends string = string> = {
  kind: 'enum'
  param: string
  label: string
  options: { value: TValue; label: string }[]
}

export type FilterSpec = BooleanFilterSpec | EnumFilterSpec

/** Pagination defaults — feel free to override per entity. */
export const DEFAULT_PAGE_SIZE = 24
export const PAGE_SIZE_OPTIONS = [12, 24, 48] as const

/**
 * Normalized read of the URL search params used by every index page.
 */
export type EntityIndexParams = {
  q: string
  page: number
  pageSize: number
  /** Raw filter values keyed by spec.param (string | null). */
  filters: Record<string, string | null>
}
