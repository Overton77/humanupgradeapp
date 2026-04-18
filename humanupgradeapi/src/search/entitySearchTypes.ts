import type {
  Biomarker,
  CaseStudy,
  Claim,
  ClaimConfidence,
  ClaimStance,
  ClaimType,
  Episode,
  LabTest,
  Organization,
  OrganizationType,
  Person,
  Podcast,
  Product,
  PublishStatus,
  TranscriptStatus,
  Compound,
} from '../../generated/client.js'
import type { EmbeddingSourceEntity } from './embeddings/types.js'

export type SearchMode = 'NONE' | 'LEXICAL' | 'SEMANTIC' | 'HYBRID'

export type SearchScoreFields = {
  lexicalScore: number | null
  semanticScore: number | null
  hybridScore: number | null
}

export type SearchRow = {
  id: string
  lexicalScore: number | null
  semanticScore: number | null
  hybridScore: number | null
}

export type BaseSearchInput = {
  mode?: SearchMode | null
  query?: string | null
  limit?: number | null
  offset?: number | null
}

export type NormalizedSearchInput<T extends BaseSearchInput> = Omit<
  T,
  'mode' | 'query' | 'limit' | 'offset'
> & {
  mode: SearchMode
  query: string | null
  /** `null` means no cap (return all rows after offset). Omitted/`undefined` becomes the default page size. */
  limit: number | null
  offset: number
}

export type PodcastSearchInput = BaseSearchInput & {
  isPublished?: boolean | null
  language?: string | null
}

export type EpisodeSearchInput = BaseSearchInput & {
  podcastId?: string | null
  isPublished?: boolean | null
  publishStatus?: PublishStatus | null
  transcriptStatus?: TranscriptStatus | null
  episodeNumber?: number | null
  seasonNumber?: number | null
}

export type ClaimSearchInput = BaseSearchInput & {
  episodeId?: string | null
  speakerId?: string | null
  claimType?: ClaimType | null
  stance?: ClaimStance | null
  claimConfidence?: ClaimConfidence | null
}

export type PersonSearchInput = BaseSearchInput & {
  title?: string | null
}

export type OrganizationSearchInput = BaseSearchInput & {
  organizationType?: OrganizationType | null
}

export type ProductSearchInput = BaseSearchInput & {
  organizationId?: string | null
  isActive?: boolean | null
  isLabTestPanelDefinition?: boolean | null
  category?: string | null
  currency?: string | null
}

export type CompoundSearchInput = BaseSearchInput & {
  externalRef?: string | null
}

export type LabTestSearchInput = BaseSearchInput & {
  productId?: string | null
  organizationId?: string | null
  sampleType?: string | null
  labName?: string | null
}

export type BiomarkerSearchInput = BaseSearchInput & {
  unit?: string | null
  category?: string | null
}

export type CaseStudySearchInput = BaseSearchInput & {
  studyType?: string | null
  journal?: string | null
  doi?: string | null
}

export type SearchInputMap = {
  podcast: PodcastSearchInput
  episode: EpisodeSearchInput
  claim: ClaimSearchInput
  person: PersonSearchInput
  organization: OrganizationSearchInput
  product: ProductSearchInput
  compound: CompoundSearchInput
  labTest: LabTestSearchInput
  biomarker: BiomarkerSearchInput
  caseStudy: CaseStudySearchInput
}

export type SearchRecordMap = {
  podcast: Podcast
  episode: Episode
  claim: Claim
  person: Person
  organization: Organization
  product: Product
  compound: Compound
  labTest: LabTest
  biomarker: Biomarker
  caseStudy: CaseStudy
}

export type SearchResultKeyMap = {
  podcast: 'podcast'
  episode: 'episode'
  claim: 'claim'
  person: 'person'
  organization: 'organization'
  product: 'product'
  compound: 'compound'
  labTest: 'labTest'
  biomarker: 'biomarker'
  caseStudy: 'caseStudy'
}

export type SearchHit<K extends string, T> = SearchScoreFields & Record<K, T>

export type SearchResult<TItem> = {
  items: TItem[]
  total: number
}

export type SearchHitForEntity<E extends EmbeddingSourceEntity> = SearchHit<
  SearchResultKeyMap[E],
  SearchRecordMap[E]
>

export type SearchResultForEntity<E extends EmbeddingSourceEntity> = SearchResult<
  SearchHitForEntity<E>
>

export type PodcastSearchHit = SearchHit<'podcast', Podcast>
export type EpisodeSearchHit = SearchHit<'episode', Episode>
export type ClaimSearchHit = SearchHit<'claim', Claim>
export type PersonSearchHit = SearchHit<'person', Person>
export type OrganizationSearchHit = SearchHit<'organization', Organization>
export type ProductSearchHit = SearchHit<'product', Product>
export type CompoundSearchHit = SearchHit<'compound', Compound>
export type LabTestSearchHit = SearchHit<'labTest', LabTest>
export type BiomarkerSearchHit = SearchHit<'biomarker', Biomarker>
export type CaseStudySearchHit = SearchHit<'caseStudy', CaseStudy>

export type PodcastSearchResult = SearchResult<PodcastSearchHit>
export type EpisodeSearchResult = SearchResult<EpisodeSearchHit>
export type ClaimSearchResult = SearchResult<ClaimSearchHit>
export type PersonSearchResult = SearchResult<PersonSearchHit>
export type OrganizationSearchResult = SearchResult<OrganizationSearchHit>
export type ProductSearchResult = SearchResult<ProductSearchHit>
export type CompoundSearchResult = SearchResult<CompoundSearchHit>
export type LabTestSearchResult = SearchResult<LabTestSearchHit>
export type BiomarkerSearchResult = SearchResult<BiomarkerSearchHit>
export type CaseStudySearchResult = SearchResult<CaseStudySearchHit>
