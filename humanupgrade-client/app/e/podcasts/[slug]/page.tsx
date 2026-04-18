import type { Metadata } from 'next'
import { GetPodcastDocument } from '@/lib/gql'
import { rscQuery } from '@/lib/apollo/queries'
import { entityRoutes } from '@/lib/entities/routes'
import { formatDuration, formatPublishDate } from '@/lib/utils/format'
import { EntityPageShell } from '@/components/entity/EntityPageShell'
import { EntityHeader } from '@/components/entity/EntityHeader'
import { EntityActions } from '@/components/entity/EntityActions'
import { EntityNotFound } from '@/components/entity/EntityNotFound'
import { RelationRail, RelationGroup } from '@/components/entity/RelationRail'
import { RelationChip } from '@/components/entity/RelationChip'

export const revalidate = 60
type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await rscQuery(GetPodcastDocument, { slug })
  return { title: data?.podcast?.title ?? 'Podcast' }
}

export default async function PodcastPage({ params }: Props) {
  const { slug } = await params
  const data = await rscQuery(GetPodcastDocument, { slug })
  const p = data?.podcast

  if (!p) return <EntityPageShell main={<EntityNotFound kind="Podcast" identifier={slug} />} rail={null} />

  const url = entityRoutes.podcast(p.slug)

  return (
    <EntityPageShell
      main={
        <article className="space-y-6">
          <EntityHeader
            kicker="Podcast"
            title={p.title}
            subtitle={p.subtitle ?? p.description}
            meta={p.hostName ? <>Hosted by {p.hostName}</> : null}
            actions={<EntityActions shareUrl={url} entityKind="podcast" />}
            backHref="/search?type=podcast"
            backLabel="All podcasts"
          />
        </article>
      }
      rail={
        <RelationRail>
          <RelationGroup title="Episodes" count={p.episodes.length}>
            {p.episodes.slice(0, 50).map((e) => (
              <RelationChip
                key={e.id}
                href={entityRoutes.episode(e.slug)}
                title={e.title}
                helper={[
                  e.episodeNumber != null ? `#${e.episodeNumber}` : null,
                  formatPublishDate(e.publishedAt),
                  formatDuration(e.durationSeconds),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              />
            ))}
          </RelationGroup>
        </RelationRail>
      }
    />
  )
}
