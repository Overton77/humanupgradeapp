import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, type EntityIndexParams, type FilterSpec } from './types'

/**
 * Parse Next.js searchParams into a normalized EntityIndexParams shape.
 * Pure — no React, easy to test.
 */
export function parseEntityIndexParams(
  raw: Record<string, string | string[] | undefined> | undefined,
  filters: FilterSpec[],
): EntityIndexParams {
  const get = (k: string): string | null => {
    const v = raw?.[k]
    if (v == null) return null
    return Array.isArray(v) ? v[0] ?? null : v
  }

  const q = (get('q') ?? '').trim()
  const page = clampInt(get('page'), 1, 10_000, 1)

  const sizeFromUrl = clampInt(get('size'), 1, 200, DEFAULT_PAGE_SIZE)
  const pageSize = (PAGE_SIZE_OPTIONS as readonly number[]).includes(sizeFromUrl)
    ? sizeFromUrl
    : DEFAULT_PAGE_SIZE

  const filterValues: Record<string, string | null> = {}
  for (const f of filters) filterValues[f.param] = get(f.param)

  return { q, page, pageSize, filters: filterValues }
}

/**
 * Compute API offset/limit + a `mode` recommendation from page params.
 * `mode` defaults to HYBRID when there's a query, NONE otherwise.
 */
export function paramsToApiPagination(p: EntityIndexParams) {
  return {
    limit: p.pageSize,
    offset: (p.page - 1) * p.pageSize,
    query: p.q.length > 0 ? p.q : null,
    mode: p.q.length > 0 ? 'HYBRID' : 'NONE',
  } as const
}

/**
 * Build a URL string for the same route with one or more params overridden.
 * Used by pagination + filter pills.
 */
export function buildIndexHref(
  pathname: string,
  current: EntityIndexParams,
  overrides: Partial<{ q: string; page: number; pageSize: number; filters: Record<string, string | null> }>,
) {
  const params = new URLSearchParams()
  const q = overrides.q ?? current.q
  if (q) params.set('q', q)

  const page = overrides.page ?? current.page
  if (page > 1) params.set('page', String(page))

  const size = overrides.pageSize ?? current.pageSize
  if (size !== DEFAULT_PAGE_SIZE) params.set('size', String(size))

  const merged = { ...current.filters, ...(overrides.filters ?? {}) }
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v)
  }

  const qs = params.toString()
  return qs ? `${pathname}?${qs}` : pathname
}

function clampInt(raw: string | null, min: number, max: number, fallback: number): number {
  if (raw == null) return fallback
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

/* ─── URL → API filter readers (server-side use) ─────────────────────────── */

/**
 * Read a boolean filter from parsed params. Convention: "true" → true,
 * anything else (including "false", null, "") → undefined (filter omitted).
 *
 * If you need a tri-state ("true" / "false" / unset), call this twice or
 * branch in the page directly — keeping this helper unambiguous.
 */
export function readBooleanFilter(
  current: EntityIndexParams,
  param: string,
): boolean | undefined {
  return current.filters[param] === 'true' ? true : undefined
}

/**
 * Read an enum filter from parsed params, narrowing to the allowed values.
 * Returns undefined if absent or if the URL contains a value not in `allowed`.
 *
 * The `allowed` array is usually the values from your enum spec / GraphQL
 * codegen enum (e.g. `Object.values(ClaimStance)`).
 */
export function readEnumFilter<TValue extends string>(
  current: EntityIndexParams,
  param: string,
  allowed: readonly TValue[],
): TValue | undefined {
  const raw = current.filters[param]
  if (!raw) return undefined
  return (allowed as readonly string[]).includes(raw) ? (raw as TValue) : undefined
}
