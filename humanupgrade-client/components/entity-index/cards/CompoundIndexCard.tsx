import type { CompoundCardFieldsFragment } from '@/lib/gql'
import { entityRoutes } from '@/lib/entities/routes'
import { EntityIndexCard } from '@/components/entity-index/EntityIndexCard'

export function CompoundIndexCard({ compound }: { compound: CompoundCardFieldsFragment }) {
  return (
    <EntityIndexCard
      href={entityRoutes.compound(compound.slug)}
      title={compound.name}
      description={compound.description}
      meta={compound.canonicalName}
      badges={compound.mechanisms.slice(0, 2).map((m) => ({ label: m }))}
    />
  )
}
