import type { Metadata } from 'next'
import { ListLabTestsDocument, SearchMode, type LabTestSearchInput } from '@/lib/gql'
import { rscQuery } from '@/lib/apollo/queries'
import { parseEntityIndexParams, paramsToApiPagination } from '@/lib/entity-index/params'
import type { FilterSpec } from '@/lib/entity-index/types'
import { EntityIndexShell } from '@/components/entity-index/EntityIndexShell'
import { EntityIndexControls } from '@/components/entity-index/EntityIndexControls'
import { EntityIndexGrid, EntityIndexEmpty } from '@/components/entity-index/EntityIndexCard'
import { EntityIndexPagination } from '@/components/entity-index/EntityIndexPagination'
import { LabTestIndexCard } from '@/components/entity-index/cards/LabTestIndexCard'

export const metadata: Metadata = { title: 'Lab tests' }
export const dynamic = 'force-dynamic'

const FILTERS: FilterSpec[] = []

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function LabTestsIndexPage({ searchParams }: Props) {
  const sp = await searchParams
  const current = parseEntityIndexParams(sp, FILTERS)
  const pagination = paramsToApiPagination(current)

  const input: LabTestSearchInput = {
    mode: pagination.mode === 'HYBRID' ? SearchMode.Hybrid : SearchMode.None,
    query: pagination.query,
    limit: pagination.limit,
    offset: pagination.offset,
  }

  const data = await rscQuery(ListLabTestsDocument, { input })
  const total = data?.labTests.total ?? null
  const items = data?.labTests.items ?? []

  return (
    <EntityIndexShell
      kicker="Lab tests"
      title="Lab tests"
      description="Diagnostic panels and individual tests — what they sample, who runs them, and which biomarkers they cover."
      controls={
        <EntityIndexControls
          current={current}
          filters={FILTERS}
          searchPlaceholder="Search lab tests…"
          total={total}
        />
      }
    >
      {items.length === 0 ? (
        <EntityIndexEmpty hasQueryOrFilter={current.q.length > 0} kindPlural="lab tests" />
      ) : (
        <EntityIndexGrid>
          {items.map((hit) => (
            <LabTestIndexCard key={hit.labTest.id} labTest={hit.labTest} />
          ))}
        </EntityIndexGrid>
      )}

      <EntityIndexPagination current={current} pathname="/e/lab-tests" total={total ?? 0} />
    </EntityIndexShell>
  )
}
