import type { Metadata } from 'next'
import { ExternalLinkIcon } from 'lucide-react'
import { GetPersonDocument } from '@/lib/gql'
import { rscQuery } from '@/lib/apollo/queries'
import { entityRoutes } from '@/lib/entities/routes'
import { formatPublishDate } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  const data = await rscQuery(GetPersonDocument, { slug })
  return { title: data?.person?.fullName ?? 'Person' }
}

export default async function PersonPage({ params }: Props) {
  const { slug } = await params
  const data = await rscQuery(GetPersonDocument, { slug })
  const p = data?.person

  if (!p) return <EntityPageShell main={<EntityNotFound kind="Person" identifier={slug} />} rail={null} />

  const url = entityRoutes.person(p.slug)

  const externalLinks = [
    p.websiteUrl ? { label: 'Website', href: p.websiteUrl } : null,
    p.linkedinUrl ? { label: 'LinkedIn', href: p.linkedinUrl } : null,
    p.xUrl ? { label: 'X / Twitter', href: p.xUrl } : null,
  ].filter((x): x is { label: string; href: string } => Boolean(x))

  return (
    <EntityPageShell
      main={
        <article className="space-y-6">
          <EntityHeader
            kicker="Person"
            title={p.fullName}
            subtitle={p.title}
            actions={
              <>
                <EntityActions shareUrl={url} entityKind="person" />
                {externalLinks.map((l) => (
                  <Button key={l.href} size="sm" variant="outline" asChild>
                    <a href={l.href} target="_blank" rel="noopener noreferrer">
                      <ExternalLinkIcon className="size-4" aria-hidden /> {l.label}
                    </a>
                  </Button>
                ))}
              </>
            }
            backHref="/search?type=person"
            backLabel="All people"
          />

          {p.bio ? <p className="text-sm leading-relaxed">{p.bio}</p> : null}

          {p.expertiseAreas.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Expertise</h3>
              <div className="flex flex-wrap gap-1.5">
                {p.expertiseAreas.map((e) => <Badge key={e} variant="secondary">{e}</Badge>)}
              </div>
            </section>
          )}
        </article>
      }
      rail={
        <RelationRail>
          <RelationGroup title="Guest on episodes" count={p.guestEpisodes.length} hideWhenEmpty>
            {p.guestEpisodes.slice(0, 30).map((e) => (
              <RelationChip
                key={e.id}
                href={entityRoutes.episode(e.slug)}
                title={e.title}
                helper={formatPublishDate(e.publishedAt)}
              />
            ))}
          </RelationGroup>

          <RelationGroup title="Spoken claims" count={p.spokenClaims.length} hideWhenEmpty>
            {p.spokenClaims.slice(0, 20).map((c) => (
              <RelationChip
                key={c.id}
                href={entityRoutes.claim(c.id)}
                title={c.text.slice(0, 80) + (c.text.length > 80 ? '…' : '')}
                helper={c.stance.toLowerCase()}
              />
            ))}
          </RelationGroup>

          <RelationGroup title="Owns organizations" count={p.ownedOrganizations.length} hideWhenEmpty>
            {p.ownedOrganizations.map((o) => (
              <RelationChip key={o.id} href={entityRoutes.organization(o.slug)} title={o.name} helper={o.organizationType.toLowerCase()} />
            ))}
          </RelationGroup>

          <RelationGroup title="Executive at" count={p.executiveOrganizations.length} hideWhenEmpty>
            {p.executiveOrganizations.map((o) => (
              <RelationChip key={o.id} href={entityRoutes.organization(o.slug)} title={o.name} helper={o.organizationType.toLowerCase()} />
            ))}
          </RelationGroup>
        </RelationRail>
      }
    />
  )
}
