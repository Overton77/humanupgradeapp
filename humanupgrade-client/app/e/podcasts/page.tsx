import type { Metadata } from 'next'
import { ListPodcastsDocument, SearchMode, type PodcastSearchInput } from '@/lib/gql'
import { rscQuery } from '@/lib/apollo/queries'
import { parseEntityIndexParams, paramsToApiPagination } from '@/lib/entity-index/params'
import type { FilterSpec } from '@/lib/entity-index/types'
import { EntityIndexShell } from '@/components/entity-index/EntityIndexShell'
import { EntityIndexControls } from '@/components/entity-index/EntityIndexControls'
import { EntityIndexGrid, EntityIndexEmpty } from '@/components/entity-index/EntityIndexCard'
import { EntityIndexPagination } from '@/components/entity-index/EntityIndexPagination'
import { PodcastIndexCard } from '@/components/entity-index/cards/PodcastIndexCard'

export const metadata: Metadata = { title: 'Podcasts' }
export const dynamic = 'force-dynamic'

const FILTERS: FilterSpec[] = [
  {
    kind: 'boolean',
    param: 'published',
    label: 'Published only',
    toApiValue: (raw) => (raw === 'true' ? true : undefined),
  },
]

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function PodcastsIndexPage({ searchParams }: Props) {
  const sp = await searchParams
  const current = parseEntityIndexParams(sp, FILTERS)
  const pagination = paramsToApiPagination(current)

  const input: PodcastSearchInput = {
    mode: pagination.mode === 'HYBRID' ? SearchMode.Hybrid : SearchMode.None,
    query: pagination.query,
    limit: pagination.limit,
    offset: pagination.offset,
    isPublished: FILTERS[0].toApiValue(current.filters.published) as boolean | undefined,
  }

  const data = await rscQuery(ListPodcastsDocument, { input })
  const total = data?.podcasts.total ?? null
  const items = data?.podcasts.items ?? []

  return (
    <EntityIndexShell
      kicker="Podcasts"
      title="Podcasts"
      description="Source podcasts whose episodes feed the knowledge graph."
      controls={
        <EntityIndexControls
          current={current}
          filters={FILTERS}
          searchPlaceholder="Search podcasts…"
          total={total}
        />
      }
    >
      {items.length === 0 ? (
        <EntityIndexEmpty
          hasQueryOrFilter={current.q.length > 0 || Object.values(current.filters).some(Boolean)}
          kindPlural="podcasts"
        />
      ) : (
        <EntityIndexGrid>
          {items.map((hit) => (
            <PodcastIndexCard key={hit.podcast.id} podcast={hit.podcast} />
          ))}
        </EntityIndexGrid>
      )}

      <EntityIndexPagination current={current} pathname="/e/podcasts" total={total ?? 0} />
    </EntityIndexShell>
  )
}
