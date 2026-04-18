import type { OrganizationCardFieldsFragment } from '@/lib/gql'
import { entityRoutes } from '@/lib/entities/routes'
import { EntityIndexCard } from '@/components/entity-index/EntityIndexCard'

export function OrganizationIndexCard({ organization: o }: { organization: OrganizationCardFieldsFragment }) {
  return (
    <EntityIndexCard
      href={entityRoutes.organization(o.slug)}
      title={o.name}
      description={o.description}
      meta={o.headquarters}
      badges={[{ label: o.organizationType.toLowerCase(), variant: 'outline' as const }]}
    />
  )
}
