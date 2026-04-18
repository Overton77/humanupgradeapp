import type { ClaimCardFieldsFragment } from '@/lib/gql'
import { entityRoutes } from '@/lib/entities/routes'
import { EntityIndexCard } from '@/components/entity-index/EntityIndexCard'

type Episode = { id: string; slug: string; title: string }
type Speaker = { id: string; slug: string; fullName: string }
type ClaimWithRelations = ClaimCardFieldsFragment & {
  episode?: Episode | null
  speaker?: Speaker | null
}

/**
 * Claims don't have a "name" — the claim text IS the title. Truncated by
 * the `line-clamp-2` on EntityIndexCard.
 */
export function ClaimIndexCard({ claim: c }: { claim: ClaimWithRelations }) {
  return (
    <EntityIndexCard
      href={entityRoutes.claim(c.id)}
      title={c.text}
      description={c.evidenceExcerpt}
      meta={c.speaker?.fullName ?? c.probableSpeaker ?? undefined}
      badges={[
        { label: c.stance.toLowerCase(), variant: 'default' },
        { label: c.claimConfidence.toLowerCase().replace('_', ' '), variant: 'secondary' },
        { label: c.claimType.toLowerCase().replace(/_/g, ' '), variant: 'outline' },
      ]}
    />
  )
}
