import type { PersonCardFieldsFragment } from '@/lib/gql'
import { entityRoutes } from '@/lib/entities/routes'
import { EntityIndexCard } from '@/components/entity-index/EntityIndexCard'

export function PersonIndexCard({ person: p }: { person: PersonCardFieldsFragment }) {
  return (
    <EntityIndexCard
      href={entityRoutes.person(p.slug)}
      title={p.fullName}
      description={p.bio}
      meta={p.title}
      badges={p.expertiseAreas.slice(0, 3).map((e) => ({ label: e }))}
    />
  )
}
