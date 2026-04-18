import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { rscQuery } from '@/lib/apollo/queries'
import { GlobalSearchDocument, SearchMode, GlobalSearchEntityType } from '@/lib/gql'
import { GlobalSearchResults } from '@/components/search/GlobalSearchResults'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { SiteHeader } from '@/components/marketing/SiteHeader'
import { SiteFooter } from '@/components/marketing/SiteFooter'

export const dynamic = 'force-dynamic'

type SearchPageProps = {
  searchParams: Promise<{ q?: string; type?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  return { title: q ? `Search: ${q}` : 'Search' }
}

const TYPE_FILTERS: { label: string; type?: GlobalSearchEntityType }[] = [
  { label: 'All' },
  { label: 'Episodes', type: GlobalSearchEntityType.Episode },
  { label: 'Claims', type: GlobalSearchEntityType.Claim },
  { label: 'Compounds', type: GlobalSearchEntityType.Compound },
  { label: 'Products', type: GlobalSearchEntityType.Product },
  { label: 'Case studies', type: GlobalSearchEntityType.CaseStudy },
  { label: 'Biomarkers', type: GlobalSearchEntityType.Biomarker },
  { label: 'People', type: GlobalSearchEntityType.Person },
  { label: 'Organizations', type: GlobalSearchEntityType.Organization },
  { label: 'Lab tests', type: GlobalSearchEntityType.LabTest },
  { label: 'Podcasts', type: GlobalSearchEntityType.Podcast },
]

/** Map a UI type-param ("episode", "caseStudy") to its GraphQL enum value. */
function uiTypeToEnum(t?: string): GlobalSearchEntityType | undefined {
  if (!t) return undefined
  const map: Record<string, GlobalSearchEntityType> = {
    episode: GlobalSearchEntityType.Episode,
    podcast: GlobalSearchEntityType.Podcast,
    claim: GlobalSearchEntityType.Claim,
    person: GlobalSearchEntityType.Person,
    organization: GlobalSearchEntityType.Organization,
    product: GlobalSearchEntityType.Product,
    compound: GlobalSearchEntityType.Compound,
    labTest: GlobalSearchEntityType.LabTest,
    biomarker: GlobalSearchEntityType.Biomarker,
    caseStudy: GlobalSearchEntityType.CaseStudy,
  }
  return map[t]
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '', type } = await searchParams
  const trimmed = q.trim()
  const enumType = uiTypeToEnum(type)

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {trimmed ? <>Results for <span className="text-foreground/80">&ldquo;{trimmed}&rdquo;</span></> : 'Search'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Hybrid (lexical + semantic) search across the knowledge graph.
            </p>
          </header>

          <FilterBar q={trimmed} activeType={type} />

          {trimmed.length === 0 ? (
            <EmptyHint message="Enter a query to search — try 'HRV', 'magnesium', or 'sleep'." />
          ) : (
            <Suspense fallback={<SearchResultsSkeleton />}>
              <SearchResultsServer query={trimmed} type={enumType} />
            </Suspense>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

async function SearchResultsServer({
  query,
  type,
}: {
  query: string
  type?: GlobalSearchEntityType
}) {
  const data = await rscQuery(GlobalSearchDocument, {
    input: {
      query,
      perTypeLimit: type ? 50 : 8,
      types: type ? [type] : null,
      mode: SearchMode.Hybrid,
    },
  })

  if (!data?.search) {
    return <EmptyHint message="Couldn't reach the API. Try again in a moment." />
  }

  if (data.search.totalAcrossTypes === 0) {
    return <EmptyHint message={`No results for "${query}".`} />
  }

  return (
    <>
      <p className="text-xs text-muted-foreground">
        {data.search.totalAcrossTypes.toLocaleString()} result{data.search.totalAcrossTypes === 1 ? '' : 's'}
      </p>
      <GlobalSearchResults
        data={data.search}
        variant="full"
        baseHref={`/search?q=${encodeURIComponent(query)}`}
      />
    </>
  )
}

function FilterBar({ q, activeType }: { q: string; activeType?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {TYPE_FILTERS.map((f) => {
        const uiType = enumToUi(f.type)
        const isActive = (uiType ?? '') === (activeType ?? '')
        const href = uiType ? `/search?q=${encodeURIComponent(q)}&type=${uiType}` : `/search?q=${encodeURIComponent(q)}`
        return (
          <Link key={f.label} href={href}>
            <Badge variant={isActive ? 'default' : 'outline'} className="cursor-pointer">
              {f.label}
            </Badge>
          </Link>
        )
      })}
    </div>
  )
}

function enumToUi(e?: GlobalSearchEntityType): string | undefined {
  if (!e) return undefined
  const map: Record<GlobalSearchEntityType, string> = {
    [GlobalSearchEntityType.Episode]: 'episode',
    [GlobalSearchEntityType.Podcast]: 'podcast',
    [GlobalSearchEntityType.Claim]: 'claim',
    [GlobalSearchEntityType.Person]: 'person',
    [GlobalSearchEntityType.Organization]: 'organization',
    [GlobalSearchEntityType.Product]: 'product',
    [GlobalSearchEntityType.Compound]: 'compound',
    [GlobalSearchEntityType.LabTest]: 'labTest',
    [GlobalSearchEntityType.Biomarker]: 'biomarker',
    [GlobalSearchEntityType.CaseStudy]: 'caseStudy',
  }
  return map[e]
}

function EmptyHint({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground py-12 text-center">{message}</p>
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  )
}
