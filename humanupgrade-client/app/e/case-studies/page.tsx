import type { Metadata } from 'next'
import { ListCaseStudiesDocument, SearchMode, type CaseStudySearchInput } from '@/lib/gql'
import { rscQuery } from '@/lib/apollo/queries'
import { parseEntityIndexParams, paramsToApiPagination } from '@/lib/entity-index/params'
import type { FilterSpec } from '@/lib/entity-index/types'
import { EntityIndexShell } from '@/components/entity-index/EntityIndexShell'
import { EntityIndexControls } from '@/components/entity-index/EntityIndexControls'
import { EntityIndexGrid, EntityIndexEmpty } from '@/components/entity-index/EntityIndexCard'
import { EntityIndexPagination } from '@/components/entity-index/EntityIndexPagination'
import { CaseStudyIndexCard } from '@/components/entity-index/cards/CaseStudyIndexCard'

export const metadata: Metadata = { title: 'Case studies' }
export const dynamic = 'force-dynamic'

const FILTERS: FilterSpec[] = []

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function CaseStudiesIndexPage({ searchParams }: Props) {
  const sp = await searchParams
  const current = parseEntityIndexParams(sp, FILTERS)
  const pagination = paramsToApiPagination(current)

  const input: CaseStudySearchInput = {
    mode: pagination.mode === 'HYBRID' ? SearchMode.Hybrid : SearchMode.None,
    query: pagination.query,
    limit: pagination.limit,
    offset: pagination.offset,
  }

  const data = await rscQuery(ListCaseStudiesDocument, { input })
  const total = data?.caseStudies.total ?? null
  const items = data?.caseStudies.items ?? []

  return (
    <EntityIndexShell
      kicker="Case studies"
      title="Case studies"
      description="Published research, trials, and clinical case reports referenced across the graph."
      controls={
        <EntityIndexControls
          current={current}
          filters={FILTERS}
          searchPlaceholder="Search case studies (title, outcome, keywords)…"
          total={total}
        />
      }
    >
      {items.length === 0 ? (
        <EntityIndexEmpty hasQueryOrFilter={current.q.length > 0} kindPlural="case studies" />
      ) : (
        <EntityIndexGrid>
          {items.map((hit) => (
            <CaseStudyIndexCard key={hit.caseStudy.id} caseStudy={hit.caseStudy} />
          ))}
        </EntityIndexGrid>
      )}

      <EntityIndexPagination current={current} pathname="/e/case-studies" total={total ?? 0} />
    </EntityIndexShell>
  )
}
