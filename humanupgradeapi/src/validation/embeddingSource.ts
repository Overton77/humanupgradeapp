import { z } from 'zod'

export const EmbeddingRelatedCompoundRefSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
})
export type EmbeddingRelatedCompoundRef = z.infer<typeof EmbeddingRelatedCompoundRefSchema>

export const EmbeddingRelatedLabTestRefSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
})
export type EmbeddingRelatedLabTestRef = z.infer<typeof EmbeddingRelatedLabTestRefSchema>

export const EmbeddingRelatedBiomarkerRefSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
})
export type EmbeddingRelatedBiomarkerRef = z.infer<typeof EmbeddingRelatedBiomarkerRefSchema>

export const EmbeddingRelatedOrganizationRefSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
})
export type EmbeddingRelatedOrganizationRef = z.infer<typeof EmbeddingRelatedOrganizationRefSchema>

export const PodcastEmbeddingSourceSchema = z.object({
  title: z.string(),
  subtitle: z.string().nullish(),
  description: z.string().nullish(),
  hostName: z.string().nullish(),
  tags: z.array(z.string()).default([]),
})
export type PodcastEmbeddingSource = z.infer<typeof PodcastEmbeddingSourceSchema>

export const EpisodeEmbeddingSourceSchema = z.object({
  title: z.string(),
  publishedSummary: z.string().nullish(),
  summary: z.string().nullish(),
  description: z.string().nullish(),
  keyTakeaways: z.array(z.string()).default([]),
  topicPrimary: z.string().nullish(),
  topicSecondary: z.array(z.string()).default([]),
  topicConcepts: z.array(z.string()).default([]),
})
export type EpisodeEmbeddingSource = z.infer<typeof EpisodeEmbeddingSourceSchema>

export const ClaimEmbeddingSourceSchema = z.object({
  text: z.string(),
  evidenceExcerpt: z.string().nullish(),
  claimType: z.string().nullish(),
  stance: z.string().nullish(),
  claimConfidence: z.string().nullish(),
})
export type ClaimEmbeddingSource = z.infer<typeof ClaimEmbeddingSourceSchema>

export const PersonEmbeddingSourceSchema = z.object({
  fullName: z.string(),
  title: z.string().nullish(),
  bio: z.string().nullish(),
  aliases: z.array(z.string()).default([]),
  expertiseAreas: z.array(z.string()).default([]),
})
export type PersonEmbeddingSource = z.infer<typeof PersonEmbeddingSourceSchema>

export const OrganizationEmbeddingSourceSchema = z.object({
  name: z.string(),
  legalName: z.string().nullish(),
  description: z.string().nullish(),
  organizationType: z.string().nullish(),
  aliases: z.array(z.string()).default([]),
  domains: z.array(z.string()).default([]),
})
export type OrganizationEmbeddingSource = z.infer<typeof OrganizationEmbeddingSourceSchema>

export const ProductEmbeddingSourceSchema = z.object({
  name: z.string(),
  category: z.string().nullish(),
  description: z.string().nullish(),
  recommendedUse: z.string().nullish(),
  benefits: z.array(z.string()).default([]),
  compounds: z.array(EmbeddingRelatedCompoundRefSchema).default([]),
  labTests: z.array(EmbeddingRelatedLabTestRefSchema).default([]),
})
export type ProductEmbeddingSource = z.infer<typeof ProductEmbeddingSourceSchema>

export const CompoundEmbeddingSourceSchema = z.object({
  name: z.string(),
  canonicalName: z.string().nullish(),
  description: z.string().nullish(),
  aliases: z.array(z.string()).default([]),
  mechanisms: z.array(z.string()).default([]),
})
export type CompoundEmbeddingSource = z.infer<typeof CompoundEmbeddingSourceSchema>

export const LabTestEmbeddingSourceSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  labName: z.string().nullish(),
  sampleType: z.string().nullish(),
  biomarkers: z.array(EmbeddingRelatedBiomarkerRefSchema).default([]),
})
export type LabTestEmbeddingSource = z.infer<typeof LabTestEmbeddingSourceSchema>

export const BiomarkerEmbeddingSourceSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  category: z.string().nullish(),
  unit: z.string().nullish(),
  referenceRange: z.string().nullish(),
  referenceAgeMin: z.number().nullish(),
  referenceAgeMax: z.number().nullish(),
  referenceRangeLow: z.number().nullish(),
  referenceRangeMax: z.number().nullish(),
  aliases: z.array(z.string()).default([]),
  relatedSystems: z.array(z.string()).default([]),
})
export type BiomarkerEmbeddingSource = z.infer<typeof BiomarkerEmbeddingSourceSchema>

export const CaseStudyEmbeddingSourceSchema = z.object({
  title: z.string(),
  description: z.string().nullish(),
  studyType: z.string().nullish(),
  outcomeSummary: z.string().nullish(),
  fullTextSummary: z.string().nullish(),
  journal: z.string().nullish(),
  sponsorOrganizations: z.array(EmbeddingRelatedOrganizationRefSchema).default([]),
  referencedOrganizations: z.array(EmbeddingRelatedOrganizationRefSchema).default([]),
})
export type CaseStudyEmbeddingSource = z.infer<typeof CaseStudyEmbeddingSourceSchema>

export const EMBEDDING_SOURCE_ENTITIES = [
  'podcast',
  'episode',
  'claim',
  'person',
  'organization',
  'product',
  'compound',
  'labTest',
  'biomarker',
  'caseStudy',
] as const
export type EmbeddingSourceEntity = (typeof EMBEDDING_SOURCE_ENTITIES)[number]

export type EmbeddingSourceDataMap = {
  podcast: PodcastEmbeddingSource
  episode: EpisodeEmbeddingSource
  claim: ClaimEmbeddingSource
  person: PersonEmbeddingSource
  organization: OrganizationEmbeddingSource
  product: ProductEmbeddingSource
  compound: CompoundEmbeddingSource
  labTest: LabTestEmbeddingSource
  biomarker: BiomarkerEmbeddingSource
  caseStudy: CaseStudyEmbeddingSource
}

export type EmbeddingSourceBundle<E extends EmbeddingSourceEntity = EmbeddingSourceEntity> = {
  entity: E
  data: EmbeddingSourceDataMap[E]
}

export const EmbeddingSourcePayloadSchema = z.discriminatedUnion('entity', [
  z.object({ entity: z.literal('podcast'), data: PodcastEmbeddingSourceSchema }),
  z.object({ entity: z.literal('episode'), data: EpisodeEmbeddingSourceSchema }),
  z.object({ entity: z.literal('claim'), data: ClaimEmbeddingSourceSchema }),
  z.object({ entity: z.literal('person'), data: PersonEmbeddingSourceSchema }),
  z.object({ entity: z.literal('organization'), data: OrganizationEmbeddingSourceSchema }),
  z.object({ entity: z.literal('product'), data: ProductEmbeddingSourceSchema }),
  z.object({ entity: z.literal('compound'), data: CompoundEmbeddingSourceSchema }),
  z.object({ entity: z.literal('labTest'), data: LabTestEmbeddingSourceSchema }),
  z.object({ entity: z.literal('biomarker'), data: BiomarkerEmbeddingSourceSchema }),
  z.object({ entity: z.literal('caseStudy'), data: CaseStudyEmbeddingSourceSchema }),
])
export type EmbeddingSourcePayload = z.infer<typeof EmbeddingSourcePayloadSchema>
