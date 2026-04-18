import type { Metadata } from 'next'
import { ExternalLinkIcon } from 'lucide-react'
import { GetCaseStudyDocument } from '@/lib/gql'
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
  const data = await rscQuery(GetCaseStudyDocument, { slug })
  return { title: data?.caseStudy?.title ?? 'Case study' }
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params
  const data = await rscQuery(GetCaseStudyDocument, { slug })
  const cs = data?.caseStudy

  if (!cs) return <EntityPageShell main={<EntityNotFound kind="Case study" identifier={slug} />} rail={null} />

  const url = entityRoutes.caseStudy(cs.slug)
  const meta = (
    <>
      {cs.studyType ? <>{cs.studyType}{' · '}</> : null}
      {cs.journal ? <>{cs.journal}{' · '}</> : null}
      {formatPublishDate(cs.publicationDate)}
      {cs.doi ? <> · DOI: {cs.doi}</> : null}
    </>
  )

  return (
    <EntityPageShell
      main={
        <article className="space-y-6">
          <EntityHeader
            kicker="Case study"
            title={cs.title}
            subtitle={cs.description}
            meta={meta}
            actions={
              <>
                <EntityActions shareUrl={url} entityKind="case study" />
                {cs.sourceUrl ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={cs.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLinkIcon className="size-4" aria-hidden />
                      Source
                    </a>
                  </Button>
                ) : null}
              </>
            }
            backHref="/e/case-studies"
            backLabel="All case studies"
          />

          {cs.outcomeSummary ? (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Outcome summary</h3>
              <p className="text-sm leading-relaxed">{cs.outcomeSummary}</p>
            </section>
          ) : null}

          {cs.fullTextSummary ? (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Full-text summary</h3>
              <p className="text-sm leading-relaxed whitespace-pre-line">{cs.fullTextSummary}</p>
            </section>
          ) : null}

          {cs.keywords.length > 0 && (
            <section>
              <div className="flex flex-wrap gap-1.5">
                {cs.keywords.map((k) => <Badge key={k} variant="secondary">{k}</Badge>)}
              </div>
            </section>
          )}
        </article>
      }
      rail={
        <RelationRail>
          <RelationGroup title="Business sponsors" count={cs.businessSponsors.length} hideWhenEmpty>
            {cs.businessSponsors.map((o) => (
              <RelationChip key={o.id} href={entityRoutes.organization(o.slug)} title={o.name} helper={o.description} />
            ))}
          </RelationGroup>

          <RelationGroup title="Referenced by" count={cs.referencedByOrganizations.length} hideWhenEmpty>
            {cs.referencedByOrganizations.map((o) => (
              <RelationChip key={o.id} href={entityRoutes.organization(o.slug)} title={o.name} helper={o.description} />
            ))}
          </RelationGroup>
        </RelationRail>
      }
    />
  )
}
