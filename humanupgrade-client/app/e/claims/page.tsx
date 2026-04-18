import type { Metadata } from 'next'
import {
  ClaimConfidence,
  ClaimStance,
  ListClaimsDocument,
  SearchMode,
  type ClaimSearchInput,
} from '@/lib/gql'
import { rscQuery } from '@/lib/apollo/queries'
import { parseEntityIndexParams, paramsToApiPagination } from '@/lib/entity-index/params'
import type { FilterSpec } from '@/lib/entity-index/types'
import { EntityIndexShell } from '@/components/entity-index/EntityIndexShell'
import { EntityIndexControls } from '@/components/entity-index/EntityIndexControls'
import { EntityIndexGrid, EntityIndexEmpty } from '@/components/entity-index/EntityIndexCard'
import { EntityIndexPagination } from '@/components/entity-index/EntityIndexPagination'
import { ClaimIndexCard } from '@/components/entity-index/cards/ClaimIndexCard'

export const metadata: Metadata = { title: 'Claims' }
export const dynamic = 'force-dynamic'

const FILTERS: FilterSpec[] = [
  {
    kind: 'enum',
    param: 'stance',
    label: 'Stance',
    options: [
      { value: 'SUPPORTS', label: 'Supports' },
      { value: 'OPPOSES', label: 'Opposes' },
      { value: 'MIXED', label: 'Mixed' },
      { value: 'NEUTRAL', label: 'Neutral' },
    ],
    toApiValue: (raw) => (raw ? raw : undefined),
  },
  {
    kind: 'enum',
    param: 'confidence',
    label: 'Confidence',
    options: [
      { value: 'VERY_HIGH', label: 'Very high' },
      { value: 'HIGH', label: 'High' },
      { value: 'MEDIUM', label: 'Medium' },
      { value: 'LOW', label: 'Low' },
    ],
    toApiValue: (raw) => (raw ? raw : undefined),
  },
]

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function ClaimsIndexPage({ searchParams }: Props) {
  const sp = await searchParams
  const current = parseEntityIndexParams(sp, FILTERS)
  const pagination = paramsToApiPagination(current)

  const input: ClaimSearchInput = {
    mode: pagination.mode === 'HYBRID' ? SearchMode.Hybrid : SearchMode.None,
    query: pagination.query,
    limit: pagination.limit,
    offset: pagination.offset,
    stance: FILTERS[0].toApiValue(current.filters.stance) as ClaimStance | undefined,
    claimConfidence: FILTERS[1].toApiValue(current.filters.confidence) as ClaimConfidence | undefined,
  }

  const data = await rscQuery(ListClaimsDocument, { input })
  const total = data?.claims.total ?? null
  const items = data?.claims.items ?? []

  return (
    <EntityIndexShell
      kicker="Claims"
      title="Claims"
      description="Atomic, sourced claims extracted from podcast episodes. Each one is anchored to a speaker, a timestamp, and a stance."
      controls={
        <EntityIndexControls
          current={current}
          filters={FILTERS}
          searchPlaceholder="Search claims…"
          total={total}
        />
      }
    >
      {items.length === 0 ? (
        <EntityIndexEmpty
          hasQueryOrFilter={current.q.length > 0 || Object.values(current.filters).some(Boolean)}
          kindPlural="claims"
        />
      ) : (
        <EntityIndexGrid>
          {items.map((hit) => (
            <ClaimIndexCard key={hit.claim.id} claim={hit.claim} />
          ))}
        </EntityIndexGrid>
      )}

      <EntityIndexPagination current={current} pathname="/e/claims" total={total ?? 0} />
    </EntityIndexShell>
  )
}
