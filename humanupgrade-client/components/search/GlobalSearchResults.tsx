import type { GlobalSearchQuery } from '@/lib/gql'
import { entityRoutes } from '@/lib/entities/routes'
import { formatDuration, formatPublishDate } from '@/lib/utils/format'
import { SearchResultGroup, SearchResultRow } from '@/components/search/SearchResultGroup'

/**
 * Pure presentational rendering of a GlobalSearchQuery result.
 * Used by both the header dialog (compact) and the /search page (full).
 *
 * Compact mode hides empty groups + clamps to the top N items per group.
 */
export function GlobalSearchResults({
  data,
  variant = 'full',
  perGroup,
  baseHref,
}: {
  data: GlobalSearchQuery['search']
  variant?: 'compact' | 'full'
  /** Cap per group; defaults: compact = 5, full = all returned items. */
  perGroup?: number
  /** Used to build "see all" links: `${baseHref}&type=episode`. */
  baseHref?: string
}) {
  const cap = perGroup ?? (variant === 'compact' ? 5 : Infinity)
  const seeAll = (type: string) => baseHref ? `${baseHref}&type=${type}` : undefined

  return (
    <div className="space-y-5">
      <SearchResultGroup
        label="Episodes"
        total={data.episodes.total}
        items={data.episodes.items.slice(0, cap)}
        seeAllHref={seeAll('episode')}
        renderItem={(hit, i) => (
          <SearchResultRow
            key={`ep-${i}-${hit.episode.id}`}
            href={entityRoutes.episode(hit.episode.slug)}
            title={hit.episode.title}
            subtitle={[
              formatPublishDate(hit.episode.publishedAt),
              formatDuration(hit.episode.durationSeconds),
              hit.episode.topicPrimary,
            ].filter(Boolean).join(' · ')}
          />
        )}
      />

      <SearchResultGroup
        label="Compounds"
        total={data.compounds.total}
        items={data.compounds.items.slice(0, cap)}
        seeAllHref={seeAll('compound')}
        renderItem={(hit, i) => (
          <SearchResultRow
            key={`cmp-${i}-${hit.compound.id}`}
            href={entityRoutes.compound(hit.compound.slug)}
            title={hit.compound.name}
            subtitle={hit.compound.canonicalName ?? hit.compound.description}
          />
        )}
      />

      <SearchResultGroup
        label="Products"
        total={data.products.total}
        items={data.products.items.slice(0, cap)}
        seeAllHref={seeAll('product')}
        renderItem={(hit, i) => (
          <SearchResultRow
            key={`prd-${i}-${hit.product.id}`}
            href={entityRoutes.product(hit.product.slug)}
            title={hit.product.name}
            subtitle={hit.product.category ?? hit.product.description}
          />
        )}
      />

      <SearchResultGroup
        label="Case studies"
        total={data.caseStudies.total}
        items={data.caseStudies.items.slice(0, cap)}
        seeAllHref={seeAll('caseStudy')}
        renderItem={(hit, i) => (
          <SearchResultRow
            key={`cs-${i}-${hit.caseStudy.id}`}
            href={entityRoutes.caseStudy(hit.caseStudy.slug)}
            title={hit.caseStudy.title}
            subtitle={[hit.caseStudy.studyType, hit.caseStudy.journal].filter(Boolean).join(' · ')}
          />
        )}
      />

      <SearchResultGroup
        label="Biomarkers"
        total={data.biomarkers.total}
        items={data.biomarkers.items.slice(0, cap)}
        seeAllHref={seeAll('biomarker')}
        renderItem={(hit, i) => (
          <SearchResultRow
            key={`bm-${i}-${hit.biomarker.id}`}
            href={entityRoutes.biomarker(hit.biomarker.slug)}
            title={hit.biomarker.name}
            subtitle={[hit.biomarker.unit, hit.biomarker.category].filter(Boolean).join(' · ')}
          />
        )}
      />

      <SearchResultGroup
        label="Claims"
        total={data.claims.total}
        items={data.claims.items.slice(0, cap)}
        seeAllHref={seeAll('claim')}
        renderItem={(hit, i) => (
          <SearchResultRow
            key={`cl-${i}-${hit.claim.id}`}
            href={entityRoutes.claim(hit.claim.id)}
            title={hit.claim.text}
            subtitle={[hit.claim.stance.toLowerCase(), hit.claim.claimType.toLowerCase().replace(/_/g, ' ')].join(' · ')}
          />
        )}
      />

      <SearchResultGroup
        label="People"
        total={data.persons.total}
        items={data.persons.items.slice(0, cap)}
        seeAllHref={seeAll('person')}
        renderItem={(hit, i) => (
          <SearchResultRow
            key={`pn-${i}-${hit.person.id}`}
            href={entityRoutes.person(hit.person.slug)}
            title={hit.person.fullName}
            subtitle={hit.person.title}
          />
        )}
      />

      <SearchResultGroup
        label="Organizations"
        total={data.organizations.total}
        items={data.organizations.items.slice(0, cap)}
        seeAllHref={seeAll('organization')}
        renderItem={(hit, i) => (
          <SearchResultRow
            key={`org-${i}-${hit.organization.id}`}
            href={entityRoutes.organization(hit.organization.slug)}
            title={hit.organization.name}
            subtitle={hit.organization.organizationType.toLowerCase()}
          />
        )}
      />

      <SearchResultGroup
        label="Lab tests"
        total={data.labTests.total}
        items={data.labTests.items.slice(0, cap)}
        seeAllHref={seeAll('labTest')}
        renderItem={(hit, i) => (
          <SearchResultRow
            key={`lt-${i}-${hit.labTest.id}`}
            href={entityRoutes.labTest(hit.labTest.slug)}
            title={hit.labTest.name}
            subtitle={hit.labTest.labName}
          />
        )}
      />

      <SearchResultGroup
        label="Podcasts"
        total={data.podcasts.total}
        items={data.podcasts.items.slice(0, cap)}
        seeAllHref={seeAll('podcast')}
        renderItem={(hit, i) => (
          <SearchResultRow
            key={`pc-${i}-${hit.podcast.id}`}
            href={entityRoutes.podcast(hit.podcast.slug)}
            title={hit.podcast.title}
            subtitle={hit.podcast.subtitle}
          />
        )}
      />
    </div>
  )
}
