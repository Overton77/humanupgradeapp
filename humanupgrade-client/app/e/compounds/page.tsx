import type { Metadata } from 'next'
import { ListCompoundsDocument, SearchMode, type CompoundSearchInput } from '@/lib/gql'
import { rscQuery } from '@/lib/apollo/queries'
import { parseEntityIndexParams, paramsToApiPagination } from '@/lib/entity-index/params'
import type { FilterSpec } from '@/lib/entity-index/types'
import { EntityIndexShell } from '@/components/entity-index/EntityIndexShell'
import { EntityIndexControls } from '@/components/entity-index/EntityIndexControls'
import { EntityIndexGrid, EntityIndexEmpty } from '@/components/entity-index/EntityIndexCard'
import { EntityIndexPagination } from '@/components/entity-index/EntityIndexPagination'
import { CompoundIndexCard } from '@/components/entity-index/cards/CompoundIndexCard'

export const metadata: Metadata = { title: 'Compounds' }
export const dynamic = 'force-dynamic'

const FILTERS: FilterSpec[] = []

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function CompoundsIndexPage({ searchParams }: Props) {
  const sp = await searchParams
  const current = parseEntityIndexParams(sp, FILTERS)
  const pagination = paramsToApiPagination(current)

  const input: CompoundSearchInput = {
    mode: pagination.mode === 'HYBRID' ? SearchMode.Hybrid : SearchMode.None,
    query: pagination.query,
    limit: pagination.limit,
    offset: pagination.offset,
  }

  const data = await rscQuery(ListCompoundsDocument, { input })
  const total = data?.compounds.total ?? null
  const items = data?.compounds.items ?? []

  return (
    <EntityIndexShell
      kicker="Compounds"
      title="Compounds"
      description="Bioactive substances — vitamins, peptides, nootropics, probiotics — referenced across products and research."
      controls={
        <EntityIndexControls
          current={current}
          filters={FILTERS}
          searchPlaceholder="Search compounds (name, mechanism, alias)…"
          total={total}
        />
      }
    >
      {items.length === 0 ? (
        <EntityIndexEmpty hasQueryOrFilter={current.q.length > 0} kindPlural="compounds" />
      ) : (
        <EntityIndexGrid>
          {items.map((hit) => (
            <CompoundIndexCard key={hit.compound.id} compound={hit.compound} />
          ))}
        </EntityIndexGrid>
      )}

      <EntityIndexPagination current={current} pathname="/e/compounds" total={total ?? 0} />
    </EntityIndexShell>
  )
}
