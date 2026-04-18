import type { Metadata } from 'next'
import Link from 'next/link'
import { getClient } from '@/lib/apollo/server-client'
import { GetEpisodeDocument, type GetEpisodeQuery } from '@/lib/gql'
import { entityRoutes } from '@/lib/entities/routes'
import { formatDuration, formatPublishDate } from '@/lib/utils/format'

import { EntityPageShell } from '@/components/entity/EntityPageShell'
import { EntityHeader } from '@/components/entity/EntityHeader'
import { EntityActions } from '@/components/entity/EntityActions'
import { EntityNotFound } from '@/components/entity/EntityNotFound'
import { RelationRail, RelationGroup } from '@/components/entity/RelationRail'
import { RelationChip } from '@/components/entity/RelationChip'

import { EpisodeTranscriptSection } from '@/components/episode/EpisodeTranscriptSection'
import { EpisodeClaimsSection } from '@/components/episode/EpisodeClaimsSection'
import { EpisodeMediaSection } from '@/components/episode/EpisodeMediaSection'
import { EpisodeSummarySection } from '@/components/episode/EpisodeSummarySection'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await fetchEpisode(slug).catch(() => null)
  const ep = data?.episode
  if (!ep) return { title: 'Episode not found' }
  return {
    title: ep.title,
    description: ep.summaryShort ?? ep.webPageSummary ?? undefined,
  }
}

async function fetchEpisode(slug: string): Promise<GetEpisodeQuery | null> {
  const { data } = await getClient().query({
    query: GetEpisodeDocument,
    variables: { slug },
  })
  return data ?? null
}

/**
 * Episode detail page — the M0 reference implementation for entity pages.
 *
 * Sections (top to bottom in the main column):
 *   - Header (title, podcast crumb, publish date, duration, actions)
 *   - Media (YouTube embed if available)
 *   - Summary (short / long / takeaways)
 *   - Transcript (collapsible, first ~6k chars by default)
 *   - Claims (sortable by confidence; M0 just lists them)
 *
 * Right rail:
 *   - Sponsors  (Organization chips)
 *   - Guests    (Person chips)
 *   - Claims by confidence summary (count by HIGH/MED/LOW)
 */
export default async function EpisodePage({ params }: Props) {
  const { slug } = await params
  const data = await fetchEpisode(slug).catch(() => null)
  const ep = data?.episode

  if (!ep) {
    return (
      <EntityPageShell
        main={<EntityNotFound kind="Episode" identifier={slug} />}
        rail={null}
      />
    )
  }

  const url = entityRoutes.episode(ep.slug)
  const meta = (
    <>
      {ep.podcast ? (
        <>
          From{' '}
          <Link href={entityRoutes.podcast(ep.podcast.slug)} className="underline underline-offset-2 hover:text-foreground">
            {ep.podcast.title}
          </Link>
          {' · '}
        </>
      ) : null}
      {ep.episodeNumber != null ? <>Ep #{ep.episodeNumber}{' · '}</> : null}
      {ep.publishedAt ? <>{formatPublishDate(ep.publishedAt)}</> : null}
      {formatDuration(ep.durationSeconds) ? <> · {formatDuration(ep.durationSeconds)}</> : null}
    </>
  )

  // Aggregate claim counts for the rail summary.
  const byConfidence = (ep.claims ?? []).reduce(
    (acc, c) => {
      const k = c.claimConfidence as keyof typeof acc
      acc[k] = (acc[k] ?? 0) + 1
      return acc
    },
    { LOW: 0, MEDIUM: 0, HIGH: 0, VERY_HIGH: 0, UNKNOWN: 0 } as Record<string, number>,
  )

  return (
    <EntityPageShell
      main={
        <article className="space-y-8">
          <EntityHeader
            kicker="Episode"
            title={ep.title}
            subtitle={ep.summaryShort ?? ep.webPageSummary}
            meta={meta}
            actions={<EntityActions shareUrl={url} entityKind="episode" />}
            backHref={ep.podcast ? entityRoutes.podcast(ep.podcast.slug) : '/e/episodes'}
            backLabel={ep.podcast ? `Back to ${ep.podcast.title}` : 'Back to episodes'}
          />

          <EpisodeMediaSection
            youtubeEmbedUrl={ep.youtubeEmbedUrl}
            audioUrl={ep.audioUrl}
            videoUrl={ep.videoUrl}
          />

          <EpisodeSummarySection
            short={ep.summaryShort}
            detailed={ep.summaryDetailed}
            keyTakeaways={ep.keyTakeaways}
            topicPrimary={ep.topicPrimary}
            topics={ep.topics}
          />

          <EpisodeTranscriptSection transcript={ep.transcript} status={ep.transcriptStatus} />

          <EpisodeClaimsSection claims={ep.claims} />
        </article>
      }
      rail={
        <RelationRail>
          <RelationGroup title="Sponsors" count={ep.sponsorOrganizations.length} hideWhenEmpty>
            {ep.sponsorOrganizations.map((o) => (
              <RelationChip
                key={o.id}
                href={entityRoutes.organization(o.slug)}
                title={o.name}
                helper={o.description}
              />
            ))}
          </RelationGroup>

          <RelationGroup title="Guests" count={ep.guests.length} hideWhenEmpty>
            {ep.guests.map((p) => (
              <RelationChip
                key={p.id}
                href={entityRoutes.person(p.slug)}
                title={p.fullName}
                helper={p.title}
              />
            ))}
          </RelationGroup>

          <RelationGroup title="Claims by confidence" count={ep.claims.length}>
            <li className="px-2 py-1 text-xs text-muted-foreground space-y-0.5">
              <div>HIGH: {byConfidence.HIGH + byConfidence.VERY_HIGH}</div>
              <div>MEDIUM: {byConfidence.MEDIUM}</div>
              <div>LOW: {byConfidence.LOW}</div>
              <div>UNKNOWN: {byConfidence.UNKNOWN}</div>
            </li>
          </RelationGroup>
        </RelationRail>
      }
    />
  )
}
