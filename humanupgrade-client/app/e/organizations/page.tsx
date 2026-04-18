import type { Metadata } from 'next'
import {
  ListOrganizationsDocument,
  OrganizationType,
  SearchMode,
  type OrganizationSearchInput,
} from '@/lib/gql'
import { rscQuery } from '@/lib/apollo/queries'
import { parseEntityIndexParams, paramsToApiPagination, readEnumFilter } from '@/lib/entity-index/params'
import type { FilterSpec } from '@/lib/entity-index/types'
import { EntityIndexShell } from '@/components/entity-index/EntityIndexShell'
import { EntityIndexControls } from '@/components/entity-index/EntityIndexControls'
import { EntityIndexGrid, EntityIndexEmpty } from '@/components/entity-index/EntityIndexCard'
import { EntityIndexPagination } from '@/components/entity-index/EntityIndexPagination'
import { OrganizationIndexCard } from '@/components/entity-index/cards/OrganizationIndexCard'

export const metadata: Metadata = { title: 'Organizations' }
export const dynamic = 'force-dynamic'

const ORG_TYPE_VALUES = [
  OrganizationType.Brand,
  OrganizationType.Manufacturer,
  OrganizationType.Lab,
  OrganizationType.Clinic,
  OrganizationType.ResearchInstitution,
  OrganizationType.Media,
  OrganizationType.Sponsor,
] as const

const FILTERS: FilterSpec[] = [
  {
    kind: 'enum',
    param: 'type',
    label: 'Type',
    options: [
      { value: OrganizationType.Brand, label: 'Brand' },
      { value: OrganizationType.Manufacturer, label: 'Manufacturer' },
      { value: OrganizationType.Lab, label: 'Lab' },
      { value: OrganizationType.Clinic, label: 'Clinic' },
      { value: OrganizationType.ResearchInstitution, label: 'Research' },
      { value: OrganizationType.Media, label: 'Media' },
      { value: OrganizationType.Sponsor, label: 'Sponsor' },
    ],
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
    organizationType: readEnumFilter(current, 'type', ORG_TYPE_VALUES),
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
