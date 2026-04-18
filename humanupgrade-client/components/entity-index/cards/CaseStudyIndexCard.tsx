import type { CaseStudyCardFieldsFragment } from '@/lib/gql'
import { entityRoutes } from '@/lib/entities/routes'
import { formatPublishDate } from '@/lib/utils/format'
import { EntityIndexCard } from '@/components/entity-index/EntityIndexCard'

export function CaseStudyIndexCard({ caseStudy: cs }: { caseStudy: CaseStudyCardFieldsFragment }) {
  return (
    <EntityIndexCard
      href={entityRoutes.caseStudy(cs.slug)}
      title={cs.title}
      description={cs.outcomeSummary ?? cs.description}
      meta={formatPublishDate(cs.publicationDate) ?? cs.journal}
      badges={cs.studyType ? [{ label: cs.studyType, variant: 'outline' }] : undefined}
    />
  )
}
