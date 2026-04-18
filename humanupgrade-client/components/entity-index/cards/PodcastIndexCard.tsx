import type { PodcastCardFieldsFragment } from '@/lib/gql'
import { entityRoutes } from '@/lib/entities/routes'
import { EntityIndexCard } from '@/components/entity-index/EntityIndexCard'

export function PodcastIndexCard({ podcast }: { podcast: PodcastCardFieldsFragment }) {
  return (
    <EntityIndexCard
      href={entityRoutes.podcast(podcast.slug)}
      title={podcast.title}
      description={podcast.subtitle ?? podcast.description}
      meta={podcast.hostName}
    />
  )
}
