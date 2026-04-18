import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLinkIcon } from 'lucide-react'
import { GetProductDocument } from '@/lib/gql'
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
  const data = await rscQuery(GetProductDocument, { slug })
  return { title: data?.product?.name ?? 'Product' }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const data = await rscQuery(GetProductDocument, { slug })
  const p = data?.product

  if (!p) return <EntityPageShell main={<EntityNotFound kind="Product" identifier={slug} />} rail={null} />

  const url = entityRoutes.product(p.slug)
  const meta = (
    <>
      {p.organization ? (
        <>
          By{' '}
          <Link href={entityRoutes.organization(p.organization.slug)} className="underline underline-offset-2 hover:text-foreground">
            {p.organization.name}
          </Link>
          {' · '}
        </>
      ) : null}
      {p.category ? <>{p.category}{' · '}</> : null}
      {p.price ? <>{p.currency ?? 'USD'} {p.price}</> : null}
    </>
  )

  return (
    <EntityPageShell
      main={
        <article className="space-y-6">
          <EntityHeader
            kicker="Product"
            title={p.name}
            subtitle={p.description}
            meta={meta}
            actions={
              <>
                <EntityActions shareUrl={url} entityKind="product" />
                {p.productUrl ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={p.productUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLinkIcon className="size-4" aria-hidden />
                      Product website
                    </a>
                  </Button>
                ) : null}
              </>
            }
            backHref="/e/products"
            backLabel="All products"
          />

          {p.recommendedUse ? (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Recommended use</h3>
              <p className="text-sm">{p.recommendedUse}</p>
            </section>
          ) : null}

          {p.benefits.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Benefits</h3>
              <div className="flex flex-wrap gap-1.5">
                {p.benefits.map((b) => (
                  <Badge key={b} variant="secondary">{b}</Badge>
                ))}
              </div>
            </section>
          )}
        </article>
      }
      rail={
        <RelationRail>
          <RelationGroup title="Contains compounds" count={p.containsCompounds.length} hideWhenEmpty>
            {p.containsCompounds.map((c) => (
              <RelationChip key={c.id} href={entityRoutes.compound(c.slug)} title={c.name} helper={c.canonicalName} />
            ))}
          </RelationGroup>

          <RelationGroup title="Lab tests" count={p.labTests.length} hideWhenEmpty>
            {p.labTests.map((t) => (
              <RelationChip key={t.id} href={entityRoutes.labTest(t.slug)} title={t.name} helper={t.labName} />
            ))}
          </RelationGroup>
        </RelationRail>
      }
    />
  )
}
