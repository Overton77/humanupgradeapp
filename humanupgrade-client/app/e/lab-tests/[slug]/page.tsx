import type { Metadata } from 'next'
import { ExternalLinkIcon } from 'lucide-react'
import { GetLabTestDocument } from '@/lib/gql'
import { rscQuery } from '@/lib/apollo/queries'
import { entityRoutes } from '@/lib/entities/routes'
import { formatPublishDate } from '@/lib/utils/format'
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
  const data = await rscQuery(GetLabTestDocument, { slug })
  return { title: data?.labTest?.name ?? 'Lab test' }
}

export default async function LabTestPage({ params }: Props) {
  const { slug } = await params
  const data = await rscQuery(GetLabTestDocument, { slug })
  const t = data?.labTest

  if (!t) return <EntityPageShell main={<EntityNotFound kind="Lab test" identifier={slug} />} rail={null} />

  const url = entityRoutes.labTest(t.slug)
  const meta = (
    <>
      {t.labName ? <>{t.labName}{' · '}</> : null}
      {t.sampleType ? <>{t.sampleType}{' · '}</> : null}
      {formatPublishDate(t.testedAt)}
    </>
  )

  return (
    <EntityPageShell
      main={
        <article className="space-y-6">
          <EntityHeader
            kicker="Lab test"
            title={t.name}
            subtitle={t.description}
            meta={meta}
            actions={
              <>
                <EntityActions shareUrl={url} entityKind="lab test" />
                {t.reportUrl ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={t.reportUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLinkIcon className="size-4" aria-hidden /> Report
                    </a>
                  </Button>
                ) : null}
              </>
            }
            backHref="/e/lab-tests"
            backLabel="All lab tests"
          />

          {t.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {t.tags.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
            </div>
          )}
        </article>
      }
      rail={
        <RelationRail>
          {t.organization ? (
            <RelationGroup title="From organization" count={1}>
              <RelationChip href={entityRoutes.organization(t.organization.slug)} title={t.organization.name} helper={t.organization.organizationType.toLowerCase()} />
            </RelationGroup>
          ) : null}
          {t.product ? (
            <RelationGroup title="From product" count={1}>
              <RelationChip href={entityRoutes.product(t.product.slug)} title={t.product.name} helper={t.product.category} />
            </RelationGroup>
          ) : null}
          <RelationGroup title="Tests biomarkers" count={t.testsBiomarkers.length} hideWhenEmpty>
            {t.testsBiomarkers.map((b) => (
              <RelationChip key={b.id} href={entityRoutes.biomarker(b.slug)} title={b.name} helper={b.unit} />
            ))}
          </RelationGroup>
        </RelationRail>
      }
    />
  )
}
