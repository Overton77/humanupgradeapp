import type { EpisodeCardFieldsFragment } from '@/lib/gql'
import { entityRoutes } from '@/lib/entities/routes'
import { formatDuration, formatPublishDate } from '@/lib/utils/format'
import { EntityIndexCard } from '@/components/entity-index/EntityIndexCard'

export function EpisodeIndexCard({ episode }: { episode: EpisodeCardFieldsFragment }) {
  return (
    <EntityIndexCard
      href={entityRoutes.episode(episode.slug)}
      title={episode.title}
      description={episode.summaryShort ?? episode.webPageSummary}
      meta={formatDuration(episode.durationSeconds) ?? formatPublishDate(episode.publishedAt)}
      badges={[
        ...(episode.episodeNumber != null ? [{ label: `#${episode.episodeNumber}`, variant: 'outline' as const }] : []),
        ...(episode.topicPrimary ? [{ label: episode.topicPrimary }] : []),
      ]}
    />
  )
}
