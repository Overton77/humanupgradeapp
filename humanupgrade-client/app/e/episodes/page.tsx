import type { Metadata } from 'next'
import {
  ListEpisodesDocument,
  PublishStatus,
  SearchMode,
  TranscriptStatus,
  type EpisodeSearchInput,
} from '@/lib/gql'
import { rscQuery } from '@/lib/apollo/queries'
import {
  parseEntityIndexParams,
  paramsToApiPagination,
  readBooleanFilter,
  readEnumFilter,
} from '@/lib/entity-index/params'
import type { FilterSpec } from '@/lib/entity-index/types'
import { EntityIndexShell } from '@/components/entity-index/EntityIndexShell'
import { EntityIndexControls } from '@/components/entity-index/EntityIndexControls'
import { EntityIndexGrid, EntityIndexEmpty } from '@/components/entity-index/EntityIndexCard'
import { EntityIndexPagination } from '@/components/entity-index/EntityIndexPagination'
import { EpisodeIndexCard } from '@/components/entity-index/cards/EpisodeIndexCard'

export const metadata: Metadata = { title: 'Episodes' }
export const dynamic = 'force-dynamic'

const TRANSCRIPT_VALUES = [
  TranscriptStatus.Stored,
  TranscriptStatus.Queued,
  TranscriptStatus.Missing,
  TranscriptStatus.Error,
] as const

const FILTERS: FilterSpec[] = [
  { kind: 'boolean', param: 'published', label: 'Published only' },
  {
    kind: 'enum',
    param: 'transcript',
    label: 'Transcript',
    options: [
      { value: TranscriptStatus.Stored, label: 'Stored' },
      { value: TranscriptStatus.Queued, label: 'Queued' },
      { value: TranscriptStatus.Missing, label: 'Missing' },
      { value: TranscriptStatus.Error, label: 'Errored' },
    ],
  },
]

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function EpisodesIndexPage({ searchParams }: Props) {
  const sp = await searchParams
  const current = parseEntityIndexParams(sp, FILTERS)
  const pagination = paramsToApiPagination(current)

  const input: EpisodeSearchInput = {
    mode: pagination.mode === 'HYBRID' ? SearchMode.Hybrid : SearchMode.None,
    query: pagination.query,
    limit: pagination.limit,
    offset: pagination.offset,
    isPublished: readBooleanFilter(current, 'published'),
    transcriptStatus: readEnumFilter(current, 'transcript', TRANSCRIPT_VALUES),
    publishStatus: PublishStatus.Ready, // index never shows hidden episodes
  }

  const data = await rscQuery(ListEpisodesDocument, { input })
  const total = data?.episodes.total ?? null
  const items = data?.episodes.items ?? []

  return (
    <EntityIndexShell
      kicker="Episodes"
      title="Episodes"
      description="Long-form podcast episodes from across the biohacking ecosystem. Search across titles + summaries + transcripts."
      controls={
        <EntityIndexControls
          current={current}
          filters={FILTERS}
          searchPlaceholder="Search episodes (title, summary, transcript)…"
          total={total}
        />
      }
    >
      {items.length === 0 ? (
        <EntityIndexEmpty
          hasQueryOrFilter={current.q.length > 0 || Object.values(current.filters).some(Boolean)}
          kindPlural="episodes"
        />
      ) : (
        <EntityIndexGrid>
          {items.map((hit) => (
            <EpisodeIndexCard key={hit.episode.id} episode={hit.episode} />
          ))}
        </EntityIndexGrid>
      )}

      <EntityIndexPagination current={current} pathname="/e/episodes" total={total ?? 0} />
    </EntityIndexShell>
  )
}
