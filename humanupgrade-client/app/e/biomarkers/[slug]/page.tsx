import type { Metadata } from 'next'
import { GetBiomarkerDocument } from '@/lib/gql'
import { rscQuery } from '@/lib/apollo/queries'
import { entityRoutes } from '@/lib/entities/routes'
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
  const data = await rscQuery(GetBiomarkerDocument, { slug })
  return { title: data?.biomarker?.name ?? 'Biomarker' }
}

export default async function BiomarkerPage({ params }: Props) {
  const { slug } = await params
  const data = await rscQuery(GetBiomarkerDocument, { slug })
  const b = data?.biomarker

  if (!b) return <EntityPageShell main={<EntityNotFound kind="Biomarker" identifier={slug} />} rail={null} />

  const url = entityRoutes.biomarker(b.slug)
  const meta = (
    <>
      {b.unit ? <>Unit: {b.unit}{' · '}</> : null}
      {b.category ? <>{b.category}</> : null}
    </>
  )

  return (
    <EntityPageShell
      main={
        <article className="space-y-6">
          <EntityHeader
            kicker="Biomarker"
            title={b.name}
            subtitle={b.description}
            meta={meta}
            actions={<EntityActions shareUrl={url} entityKind="biomarker" />}
            backHref="/e/biomarkers"
            backLabel="All biomarkers"
          />

          {(b.referenceRange || b.referenceRangeLow != null || b.referenceRangeMax != null) && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Reference range</h3>
              <p className="text-sm">
                {b.referenceRange ??
                  `${b.referenceRangeLow ?? '?'} – ${b.referenceRangeMax ?? '?'} ${b.unit ?? ''}`}
              </p>
            </section>
          )}

          {b.relatedSystems.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Related systems</h3>
              <div className="flex flex-wrap gap-1.5">
                {b.relatedSystems.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
              </div>
            </section>
          )}

          {b.aliases.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Also known as</h3>
              <div className="flex flex-wrap gap-1.5">
                {b.aliases.map((a) => <Badge key={a} variant="outline">{a}</Badge>)}
              </div>
            </section>
          )}
        </article>
      }
      rail={
        <RelationRail>
          <RelationGroup title="Tested by" count={b.labTests.length} hideWhenEmpty>
            {b.labTests.map((t) => (
              <RelationChip key={t.id} href={entityRoutes.labTest(t.slug)} title={t.name} helper={t.labName} />
            ))}
          </RelationGroup>

          <RelationGroup title="Affected by compounds" count={b.compounds.length} hideWhenEmpty>
            {b.compounds.map((c) => (
              <RelationChip key={c.id} href={entityRoutes.compound(c.slug)} title={c.name} helper={c.canonicalName} />
            ))}
          </RelationGroup>
        </RelationRail>
      }
    />
  )
}
