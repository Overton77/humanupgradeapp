import type { Metadata } from 'next'
import { ListPersonsDocument, SearchMode, type PersonSearchInput } from '@/lib/gql'
import { rscQuery } from '@/lib/apollo/queries'
import { parseEntityIndexParams, paramsToApiPagination } from '@/lib/entity-index/params'
import type { FilterSpec } from '@/lib/entity-index/types'
import { EntityIndexShell } from '@/components/entity-index/EntityIndexShell'
import { EntityIndexControls } from '@/components/entity-index/EntityIndexControls'
import { EntityIndexGrid, EntityIndexEmpty } from '@/components/entity-index/EntityIndexCard'
import { EntityIndexPagination } from '@/components/entity-index/EntityIndexPagination'
import { PersonIndexCard } from '@/components/entity-index/cards/PersonIndexCard'

export const metadata: Metadata = { title: 'People' }
export const dynamic = 'force-dynamic'

const FILTERS: FilterSpec[] = []

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function PeopleIndexPage({ searchParams }: Props) {
  const sp = await searchParams
  const current = parseEntityIndexParams(sp, FILTERS)
  const pagination = paramsToApiPagination(current)

  const input: PersonSearchInput = {
    mode: pagination.mode === 'HYBRID' ? SearchMode.Hybrid : SearchMode.None,
    query: pagination.query,
    limit: pagination.limit,
    offset: pagination.offset,
  }

  const data = await rscQuery(ListPersonsDocument, { input })
  const total = data?.persons.total ?? null
  const items = data?.persons.items ?? []

  return (
    <EntityIndexShell
      kicker="People"
      title="People"
      description="Researchers, founders, hosts, and guests referenced across the knowledge graph."
      controls={
        <EntityIndexControls
          current={current}
          filters={FILTERS}
          searchPlaceholder="Search people (name, title, expertise)…"
          total={total}
        />
      }
    >
      {items.length === 0 ? (
        <EntityIndexEmpty hasQueryOrFilter={current.q.length > 0} kindPlural="people" />
      ) : (
        <EntityIndexGrid>
          {items.map((hit) => (
            <PersonIndexCard key={hit.person.id} person={hit.person} />
          ))}
        </EntityIndexGrid>
      )}

      <EntityIndexPagination current={current} pathname="/e/people" total={total ?? 0} />
    </EntityIndexShell>
  )
}
