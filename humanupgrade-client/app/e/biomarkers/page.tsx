import type { Metadata } from 'next'
import { ListBiomarkersDocument, SearchMode, type BiomarkerSearchInput } from '@/lib/gql'
import { rscQuery } from '@/lib/apollo/queries'
import { parseEntityIndexParams, paramsToApiPagination } from '@/lib/entity-index/params'
import type { FilterSpec } from '@/lib/entity-index/types'
import { EntityIndexShell } from '@/components/entity-index/EntityIndexShell'
import { EntityIndexControls } from '@/components/entity-index/EntityIndexControls'
import { EntityIndexGrid, EntityIndexEmpty } from '@/components/entity-index/EntityIndexCard'
import { EntityIndexPagination } from '@/components/entity-index/EntityIndexPagination'
import { BiomarkerIndexCard } from '@/components/entity-index/cards/BiomarkerIndexCard'

export const metadata: Metadata = { title: 'Biomarkers' }
export const dynamic = 'force-dynamic'

const FILTERS: FilterSpec[] = []

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function BiomarkersIndexPage({ searchParams }: Props) {
  const sp = await searchParams
  const current = parseEntityIndexParams(sp, FILTERS)
  const pagination = paramsToApiPagination(current)

  const input: BiomarkerSearchInput = {
    mode: pagination.mode === 'HYBRID' ? SearchMode.Hybrid : SearchMode.None,
    query: pagination.query,
    limit: pagination.limit,
    offset: pagination.offset,
  }

  const data = await rscQuery(ListBiomarkersDocument, { input })
  const total = data?.biomarkers.total ?? null
  const items = data?.biomarkers.items ?? []

  return (
    <EntityIndexShell
      kicker="Biomarkers"
      title="Biomarkers"
      description="Measurable indicators of biological state — cardiovascular, metabolic, hormonal, and more. The set you'll be able to track in M3."
      controls={
        <EntityIndexControls
          current={current}
          filters={FILTERS}
          searchPlaceholder="Search biomarkers…"
          total={total}
        />
      }
    >
      {items.length === 0 ? (
        <EntityIndexEmpty hasQueryOrFilter={current.q.length > 0} kindPlural="biomarkers" />
      ) : (
        <EntityIndexGrid>
          {items.map((hit) => (
            <BiomarkerIndexCard key={hit.biomarker.id} biomarker={hit.biomarker} />
          ))}
        </EntityIndexGrid>
      )}

      <EntityIndexPagination current={current} pathname="/e/biomarkers" total={total ?? 0} />
    </EntityIndexShell>
  )
}
