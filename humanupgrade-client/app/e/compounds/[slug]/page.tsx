import type { Metadata } from 'next'
import { GetCompoundDocument } from '@/lib/gql'
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
  const data = await rscQuery(GetCompoundDocument, { slug })
  return { title: data?.compound?.name ?? 'Compound' }
}

export default async function CompoundPage({ params }: Props) {
  const { slug } = await params
  const data = await rscQuery(GetCompoundDocument, { slug })
  const c = data?.compound

  if (!c) return <EntityPageShell main={<EntityNotFound kind="Compound" identifier={slug} />} rail={null} />

  const url = entityRoutes.compound(c.slug)

  return (
    <EntityPageShell
      main={
        <article className="space-y-6">
          <EntityHeader
            kicker="Compound"
            title={c.name}
            subtitle={c.description}
            meta={c.canonicalName ? <>Canonical: {c.canonicalName}</> : null}
            actions={<EntityActions shareUrl={url} entityKind="compound" />}
            backHref="/search?type=compound"
            backLabel="All compounds"
          />

          {c.aliases.length > 0 && (
            <ChipList label="Also known as" items={c.aliases} />
          )}
          {c.mechanisms.length > 0 && (
            <ChipList label="Mechanisms" items={c.mechanisms} />
          )}
        </article>
      }
      rail={
        <RelationRail>
          <RelationGroup title="Found in products" count={c.products.length} hideWhenEmpty>
            {c.products.map((p) => (
              <RelationChip
                key={p.id}
                href={entityRoutes.product(p.slug)}
                title={p.name}
                helper={p.category}
              />
            ))}
          </RelationGroup>

          <RelationGroup title="Affects biomarkers" count={c.biomarkers.length} hideWhenEmpty>
            {c.biomarkers.map((b) => (
              <RelationChip
                key={b.id}
                href={entityRoutes.biomarker(b.slug)}
                title={b.name}
                helper={b.unit}
              />
            ))}
          </RelationGroup>
        </RelationRail>
      }
    />
  )
}

function ChipList({ label, items }: { label: string; items: string[] }) {
  return (
    <section>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{label}</h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((s) => (
          <Badge key={s} variant="secondary">
            {s}
          </Badge>
        ))}
      </div>
    </section>
  )
}
