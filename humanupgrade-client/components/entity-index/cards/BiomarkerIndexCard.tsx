import type { BiomarkerCardFieldsFragment } from '@/lib/gql'
import { entityRoutes } from '@/lib/entities/routes'
import { EntityIndexCard } from '@/components/entity-index/EntityIndexCard'

export function BiomarkerIndexCard({ biomarker: b }: { biomarker: BiomarkerCardFieldsFragment }) {
  return (
    <EntityIndexCard
      href={entityRoutes.biomarker(b.slug)}
      title={b.name}
      description={b.description}
      meta={b.unit}
      badges={[
        ...(b.category ? [{ label: b.category, variant: 'outline' as const }] : []),
        ...(b.relatedSystems.slice(0, 1).map((s) => ({ label: s }))),
      ]}
    />
  )
}
