import type { Metadata } from 'next'
import {
  ClaimConfidence,
  ClaimStance,
  ListClaimsDocument,
  SearchMode,
  type ClaimSearchInput,
} from '@/lib/gql'
import { rscQuery } from '@/lib/apollo/queries'
import { parseEntityIndexParams, paramsToApiPagination, readEnumFilter } from '@/lib/entity-index/params'
import type { FilterSpec } from '@/lib/entity-index/types'
import { EntityIndexShell } from '@/components/entity-index/EntityIndexShell'
import { EntityIndexControls } from '@/components/entity-index/EntityIndexControls'
import { EntityIndexGrid, EntityIndexEmpty } from '@/components/entity-index/EntityIndexCard'
import { EntityIndexPagination } from '@/components/entity-index/EntityIndexPagination'
import { ClaimIndexCard } from '@/components/entity-index/cards/ClaimIndexCard'

export const metadata: Metadata = { title: 'Claims' }
export const dynamic = 'force-dynamic'

const STANCE_VALUES = [
  ClaimStance.Supports,
  ClaimStance.Opposes,
  ClaimStance.Mixed,
  ClaimStance.Neutral,
] as const

const CONFIDENCE_VALUES = [
  ClaimConfidence.VeryHigh,
  ClaimConfidence.High,
  ClaimConfidence.Medium,
  ClaimConfidence.Low,
] as const

const FILTERS: FilterSpec[] = [
  {
    kind: 'enum',
    param: 'stance',
    label: 'Stance',
    options: [
      { value: ClaimStance.Supports, label: 'Supports' },
      { value: ClaimStance.Opposes, label: 'Opposes' },
      { value: ClaimStance.Mixed, label: 'Mixed' },
      { value: ClaimStance.Neutral, label: 'Neutral' },
    ],
  },
  {
    kind: 'enum',
    param: 'confidence',
    label: 'Confidence',
    options: [
      { value: ClaimConfidence.VeryHigh, label: 'Very high' },
      { value: ClaimConfidence.High, label: 'High' },
      { value: ClaimConfidence.Medium, label: 'Medium' },
      { value: ClaimConfidence.Low, label: 'Low' },
    ],
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
    stance: readEnumFilter(current, 'stance', STANCE_VALUES),
    claimConfidence: readEnumFilter(current, 'confidence', CONFIDENCE_VALUES),
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
