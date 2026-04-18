import type { LabTestCardFieldsFragment } from '@/lib/gql'
import { entityRoutes } from '@/lib/entities/routes'
import { formatPublishDate } from '@/lib/utils/format'
import { EntityIndexCard } from '@/components/entity-index/EntityIndexCard'

type Org = { slug: string; name: string }
type LabTestWithOrg = LabTestCardFieldsFragment & { organization?: Org | null }

export function LabTestIndexCard({ labTest: t }: { labTest: LabTestWithOrg }) {
  return (
    <EntityIndexCard
      href={entityRoutes.labTest(t.slug)}
      title={t.name}
      description={t.description}
      meta={t.organization?.name ?? t.labName ?? formatPublishDate(t.testedAt)}
      badges={t.sampleType ? [{ label: t.sampleType, variant: 'outline' }] : undefined}
    />
  )
}
