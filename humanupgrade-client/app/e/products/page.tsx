import type { Metadata } from 'next'
import { ListProductsDocument, SearchMode, type ProductSearchInput } from '@/lib/gql'
import { rscQuery } from '@/lib/apollo/queries'
import { parseEntityIndexParams, paramsToApiPagination, readBooleanFilter } from '@/lib/entity-index/params'
import type { FilterSpec } from '@/lib/entity-index/types'
import { EntityIndexShell } from '@/components/entity-index/EntityIndexShell'
import { EntityIndexControls } from '@/components/entity-index/EntityIndexControls'
import { EntityIndexGrid, EntityIndexEmpty } from '@/components/entity-index/EntityIndexCard'
import { EntityIndexPagination } from '@/components/entity-index/EntityIndexPagination'
import { ProductIndexCard } from '@/components/entity-index/cards/ProductIndexCard'

export const metadata: Metadata = { title: 'Products' }
export const dynamic = 'force-dynamic'

const FILTERS: FilterSpec[] = [
  { kind: 'boolean', param: 'active', label: 'Active only' },
]

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function ProductsIndexPage({ searchParams }: Props) {
  const sp = await searchParams
  const current = parseEntityIndexParams(sp, FILTERS)
  const pagination = paramsToApiPagination(current)

  const input: ProductSearchInput = {
    mode: pagination.mode === 'HYBRID' ? SearchMode.Hybrid : SearchMode.None,
    query: pagination.query,
    limit: pagination.limit,
    offset: pagination.offset,
    isActive: readBooleanFilter(current, 'active'),
  }

  const data = await rscQuery(ListProductsDocument, { input })
  const total = data?.products.total ?? null
  const items = data?.products.items ?? []

  return (
    <EntityIndexShell
      kicker="Products"
      title="Products"
      description="Supplements, devices, and other consumables. Each product references the compounds it contains."
      controls={
        <EntityIndexControls
          current={current}
          filters={FILTERS}
          searchPlaceholder="Search products…"
          total={total}
        />
      }
    >
      {items.length === 0 ? (
        <EntityIndexEmpty
          hasQueryOrFilter={current.q.length > 0 || Object.values(current.filters).some(Boolean)}
          kindPlural="products"
        />
      ) : (
        <EntityIndexGrid>
          {items.map((hit) => (
            <ProductIndexCard key={hit.product.id} product={hit.product} />
          ))}
        </EntityIndexGrid>
      )}

      <EntityIndexPagination current={current} pathname="/e/products" total={total ?? 0} />
    </EntityIndexShell>
  )
}
