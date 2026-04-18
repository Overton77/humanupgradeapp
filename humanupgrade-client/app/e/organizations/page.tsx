import type { Metadata } from 'next'
import {
  ListOrganizationsDocument,
  OrganizationType,
  SearchMode,
  type OrganizationSearchInput,
} from '@/lib/gql'
import { rscQuery } from '@/lib/apollo/queries'
import { parseEntityIndexParams, paramsToApiPagination } from '@/lib/entity-index/params'
import type { FilterSpec } from '@/lib/entity-index/types'
import { EntityIndexShell } from '@/components/entity-index/EntityIndexShell'
import { EntityIndexControls } from '@/components/entity-index/EntityIndexControls'
import { EntityIndexGrid, EntityIndexEmpty } from '@/components/entity-index/EntityIndexCard'
import { EntityIndexPagination } from '@/components/entity-index/EntityIndexPagination'
import { OrganizationIndexCard } from '@/components/entity-index/cards/OrganizationIndexCard'

export const metadata: Metadata = { title: 'Organizations' }
export const dynamic = 'force-dynamic'

const FILTERS: FilterSpec[] = [
  {
    kind: 'enum',
    param: 'type',
    label: 'Type',
    options: [
      { value: 'BRAND', label: 'Brand' },
      { value: 'MANUFACTURER', label: 'Manufacturer' },
      { value: 'LAB', label: 'Lab' },
      { value: 'CLINIC', label: 'Clinic' },
      { value: 'RESEARCH_INSTITUTION', label: 'Research' },
      { value: 'MEDIA', label: 'Media' },
      { value: 'SPONSOR', label: 'Sponsor' },
    ],
    toApiValue: (raw) => (raw ? raw : undefined),
  },
]

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function OrganizationsIndexPage({ searchParams }: Props) {
  const sp = await searchParams
  const current = parseEntityIndexParams(sp, FILTERS)
  const pagination = paramsToApiPagination(current)

  const input: OrganizationSearchInput = {
    mode: pagination.mode === 'HYBRID' ? SearchMode.Hybrid : SearchMode.None,
    query: pagination.query,
    limit: pagination.limit,
    offset: pagination.offset,
    organizationType: FILTERS[0].toApiValue(current.filters.type) as OrganizationType | undefined,
  }

  const data = await rscQuery(ListOrganizationsDocument, { input })
  const total = data?.organizations.total ?? null
  const items = data?.organizations.items ?? []

  return (
    <EntityIndexShell
      kicker="Organizations"
      title="Organizations"
      description="Brands, manufacturers, labs, clinics, research institutions and media — anyone with skin in the game."
      controls={
        <EntityIndexControls
          current={current}
          filters={FILTERS}
          searchPlaceholder="Search organizations…"
          total={total}
        />
      }
    >
      {items.length === 0 ? (
        <EntityIndexEmpty
          hasQueryOrFilter={current.q.length > 0 || Object.values(current.filters).some(Boolean)}
          kindPlural="organizations"
        />
      ) : (
        <EntityIndexGrid>
          {items.map((hit) => (
            <OrganizationIndexCard key={hit.organization.id} organization={hit.organization} />
          ))}
        </EntityIndexGrid>
      )}

      <EntityIndexPagination current={current} pathname="/e/organizations" total={total ?? 0} />
    </EntityIndexShell>
  )
}
