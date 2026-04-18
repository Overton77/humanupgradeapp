import type { ProductCardFieldsFragment } from '@/lib/gql'
import { entityRoutes } from '@/lib/entities/routes'
import { EntityIndexCard } from '@/components/entity-index/EntityIndexCard'

type Org = { slug: string; name: string }
type ProductWithOrg = ProductCardFieldsFragment & { organization?: Org | null }

export function ProductIndexCard({ product }: { product: ProductWithOrg }) {
  return (
    <EntityIndexCard
      href={entityRoutes.product(product.slug)}
      title={product.name}
      description={product.description}
      meta={product.organization?.name}
      badges={[
        ...(product.category ? [{ label: product.category, variant: 'outline' as const }] : []),
        ...(product.price ? [{ label: `${product.currency ?? 'USD'} ${product.price}` }] : []),
      ]}
    />
  )
}
