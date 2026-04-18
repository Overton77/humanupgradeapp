import type { Metadata } from 'next'
import { ExternalLinkIcon } from 'lucide-react'
import { GetOrganizationDocument } from '@/lib/gql'
import { rscQuery } from '@/lib/apollo/queries'
import { entityRoutes } from '@/lib/entities/routes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  const data = await rscQuery(GetOrganizationDocument, { slug })
  return { title: data?.organization?.name ?? 'Organization' }
}

export default async function OrganizationPage({ params }: Props) {
  const { slug } = await params
  const data = await rscQuery(GetOrganizationDocument, { slug })
  const o = data?.organization

  if (!o) return <EntityPageShell main={<EntityNotFound kind="Organization" identifier={slug} />} rail={null} />

  const url = entityRoutes.organization(o.slug)
  const meta = (
    <>
      {o.organizationType.toLowerCase()}
      {o.headquarters ? <> · {o.headquarters}</> : null}
      {o.foundedYear ? <> · founded {o.foundedYear}</> : null}
    </>
  )

  return (
    <EntityPageShell
      main={
        <article className="space-y-6">
          <EntityHeader
            kicker="Organization"
            title={o.name}
            subtitle={o.description}
            meta={meta}
            actions={
              <>
                <EntityActions shareUrl={url} entityKind="organization" />
                {o.websiteUrl ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={o.websiteUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLinkIcon className="size-4" aria-hidden /> Website
                    </a>
                  </Button>
                ) : null}
              </>
            }
            backHref="/search?type=organization"
            backLabel="All organizations"
          />

          {o.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {o.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
            </div>
          )}
        </article>
      }
      rail={
        <RelationRail>
          <RelationGroup title="Products" count={o.products.length} hideWhenEmpty>
            {o.products.slice(0, 30).map((p) => (
              <RelationChip key={p.id} href={entityRoutes.product(p.slug)} title={p.name} helper={p.category} />
            ))}
          </RelationGroup>

          <RelationGroup title="Executives" count={o.executives.length} hideWhenEmpty>
            {o.executives.map((p) => (
              <RelationChip key={p.id} href={entityRoutes.person(p.slug)} title={p.fullName} helper={p.title} />
            ))}
          </RelationGroup>

          <RelationGroup title="Owners" count={o.owners.length} hideWhenEmpty>
            {o.owners.map((p) => (
              <RelationChip key={p.id} href={entityRoutes.person(p.slug)} title={p.fullName} helper={p.title} />
            ))}
          </RelationGroup>

          <RelationGroup title="Lab tests" count={o.labTests.length} hideWhenEmpty>
            {o.labTests.map((t) => (
              <RelationChip key={t.id} href={entityRoutes.labTest(t.slug)} title={t.name} helper={t.labName} />
            ))}
          </RelationGroup>

          <RelationGroup title="Sponsored episodes" count={o.sponsoredEpisodes.length} hideWhenEmpty>
            {o.sponsoredEpisodes.slice(0, 30).map((e) => (
              <RelationChip key={e.id} href={entityRoutes.episode(e.slug)} title={e.title} />
            ))}
          </RelationGroup>

          <RelationGroup title="Referenced case studies" count={o.referencedCaseStudies.length} hideWhenEmpty>
            {o.referencedCaseStudies.slice(0, 20).map((cs) => (
              <RelationChip key={cs.id} href={entityRoutes.caseStudy(cs.slug)} title={cs.title} helper={cs.journal} />
            ))}
          </RelationGroup>

          <RelationGroup title="Sponsored case studies" count={o.businessSponsoredCases.length} hideWhenEmpty>
            {o.businessSponsoredCases.slice(0, 20).map((cs) => (
              <RelationChip key={cs.id} href={entityRoutes.caseStudy(cs.slug)} title={cs.title} helper={cs.journal} />
            ))}
          </RelationGroup>
        </RelationRail>
      }
    />
  )
}
