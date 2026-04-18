import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLinkIcon } from 'lucide-react'
import { GetClaimDocument } from '@/lib/gql'
import { rscQuery } from '@/lib/apollo/queries'
import { entityRoutes } from '@/lib/entities/routes'
import { formatTimestamp } from '@/lib/utils/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EntityPageShell } from '@/components/entity/EntityPageShell'
import { EntityHeader } from '@/components/entity/EntityHeader'
import { EntityActions } from '@/components/entity/EntityActions'
import { EntityNotFound } from '@/components/entity/EntityNotFound'
import { RelationRail, RelationGroup } from '@/components/entity/RelationRail'
import { RelationChip } from '@/components/entity/RelationChip'

export const revalidate = 60
type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const data = await rscQuery(GetClaimDocument, { id })
  return { title: data?.claim?.text?.slice(0, 60) ?? 'Claim' }
}

export default async function ClaimPage({ params }: Props) {
  const { id } = await params
  const data = await rscQuery(GetClaimDocument, { id })
  const c = data?.claim

  if (!c) return <EntityPageShell main={<EntityNotFound kind="Claim" identifier={id} />} rail={null} />

  const url = entityRoutes.claim(c.id)
  const ts = formatTimestamp(c.startTimeSeconds)

  const meta = (
    <>
      {c.episode ? (
        <>
          From{' '}
          <Link href={entityRoutes.episode(c.episode.slug)} className="underline underline-offset-2 hover:text-foreground">
            {c.episode.title}
          </Link>
        </>
      ) : null}
      {ts ? <> · {ts}</> : null}
      {c.speaker ? (
        <>
          {' · '}
          <Link href={entityRoutes.person(c.speaker.slug)} className="underline underline-offset-2 hover:text-foreground">
            {c.speaker.fullName}
          </Link>
        </>
      ) : c.probableSpeaker ? <> · ~ {c.probableSpeaker}</> : null}
    </>
  )

  return (
    <EntityPageShell
      main={
        <article className="space-y-6">
          <EntityHeader
            kicker="Claim"
            title={c.text}
            meta={meta}
            actions={
              <>
                <EntityActions shareUrl={url} entityKind="claim" />
                {c.sourceUrl ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLinkIcon className="size-4" aria-hidden /> Source
                    </a>
                  </Button>
                ) : null}
              </>
            }
            backHref={c.episode ? entityRoutes.episode(c.episode.slug) : '/e/claims'}
            backLabel={c.episode ? `Back to ${c.episode.title}` : 'Back to claims'}
          />

          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            <Badge>{c.stance.toLowerCase()}</Badge>
            <Badge variant="secondary">{c.claimConfidence.toLowerCase().replace('_', ' ')}</Badge>
            <Badge variant="outline">{c.claimType.toLowerCase().replace(/_/g, ' ')}</Badge>
          </div>

          {c.evidenceExcerpt ? (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Evidence excerpt</h3>
              <blockquote className="border-l-2 border-border pl-4 text-sm italic text-foreground/80">
                {c.evidenceExcerpt}
              </blockquote>
            </section>
          ) : null}

          {c.evidenceUrls.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Evidence URLs</h3>
              <ul className="text-sm space-y-1">
                {c.evidenceUrls.map((u) => (
                  <li key={u}>
                    <a href={u} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline break-all">
                      {u}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      }
      rail={
        <RelationRail>
          {c.episode ? (
            <RelationGroup title="From" count={1}>
              <RelationChip
                href={entityRoutes.episode(c.episode.slug)}
                title={c.episode.title}
                helper={c.episode.podcast?.title}
              />
            </RelationGroup>
          ) : null}
          {c.speaker ? (
            <RelationGroup title="Speaker" count={1}>
              <RelationChip
                href={entityRoutes.person(c.speaker.slug)}
                title={c.speaker.fullName}
                helper={c.speaker.title}
              />
            </RelationGroup>
          ) : null}
        </RelationRail>
      }
    />
  )
}
