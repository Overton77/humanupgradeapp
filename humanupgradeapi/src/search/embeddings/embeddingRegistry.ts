import type { ZodType } from 'zod'
import {
  BiomarkerEmbeddingSourceSchema,
  CaseStudyEmbeddingSourceSchema,
  ClaimEmbeddingSourceSchema,
  CompoundEmbeddingSourceSchema,
  EpisodeEmbeddingSourceSchema,
  OrganizationEmbeddingSourceSchema,
  PersonEmbeddingSourceSchema,
  PodcastEmbeddingSourceSchema,
  ProductEmbeddingSourceSchema,
  LabTestEmbeddingSourceSchema,
  type BiomarkerEmbeddingSource,
  type CaseStudyEmbeddingSource,
  type ClaimEmbeddingSource,
  type CompoundEmbeddingSource,
  type EpisodeEmbeddingSource,
  type OrganizationEmbeddingSource,
  type PersonEmbeddingSource,
  type PodcastEmbeddingSource,
  type ProductEmbeddingSource,
  type LabTestEmbeddingSource,
  type EmbeddingSourceDataMap,
} from '../../validation/embeddingSource.js'
import type { EmbeddingSourceEntity } from './types.js'

export type EmbeddingRegistryEntry<
  E extends EmbeddingSourceEntity,
  Row = unknown,
  Source = unknown,
> = {
  entity: E
  version: number
  sourceSchema: ZodType<Source>
  select: unknown
  buildSource: (row: Row) => Source
  buildText: (source: Source) => string
}

export type EmbeddingRegistry = {
  [E in EmbeddingSourceEntity]: EmbeddingRegistryEntry<E, any, EmbeddingSourceDataMap[E]>
}

type NamedRef = {
  name: string
  slug?: string | null
}

function cleanNullableString(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function normalizeStringList(values: Array<string | null | undefined> | null | undefined): string[] {
  return [...new Set(
    (values ?? [])
      .map(value => value?.trim())
      .filter((value): value is string => Boolean(value)),
  )].sort((left, right) => left.localeCompare(right))
}

function normalizeNamedRefs<T extends NamedRef>(values: T[] | null | undefined) {
  return [...new Map(
    (values ?? [])
      .map(value => ({
        name: value.name.trim(),
        slug: value.slug?.trim() || undefined,
      }))
      .filter(value => value.name.length > 0)
      .sort((left, right) =>
        left.name.localeCompare(right.name) || (left.slug ?? '').localeCompare(right.slug ?? ''),
      )
      .map(value => [`${value.slug ?? ''}:${value.name}`, value] as const),
  ).values()]
}

function renderLines(lines: Array<string | null | undefined | false>): string {
  return lines.filter((line): line is string => Boolean(line)).join('\n')
}

function renderStringList(label: string, values: string[]): string | undefined {
  if (!values.length) return undefined
  return `${label}: ${values.join(', ')}`
}

function renderNamedRefList(label: string, values: NamedRef[]): string | undefined {
  if (!values.length) return undefined
  return `${label}: ${values.map(value => value.name).join(', ')}`
}

function renderBiomarkerRange(source: BiomarkerEmbeddingSource): string | undefined {
  const parts = [
    source.referenceRange ? `reference range: ${source.referenceRange}` : undefined,
    source.referenceAgeMin !== null && source.referenceAgeMin !== undefined
      ? `reference age min: ${source.referenceAgeMin}`
      : undefined,
    source.referenceAgeMax !== null && source.referenceAgeMax !== undefined
      ? `reference age max: ${source.referenceAgeMax}`
      : undefined,
    source.referenceRangeLow !== null && source.referenceRangeLow !== undefined
      ? `reference low: ${source.referenceRangeLow}`
      : undefined,
    source.referenceRangeMax !== null && source.referenceRangeMax !== undefined
      ? `reference high: ${source.referenceRangeMax}`
      : undefined,
  ].filter((part): part is string => Boolean(part))

  if (!parts.length) return undefined
  return parts.join('; ')
}

export const embeddingRegistry: EmbeddingRegistry = {
  podcast: {
    entity: 'podcast',
    version: 1,
    sourceSchema: PodcastEmbeddingSourceSchema,
    select: {
      title: true,
      subtitle: true,
      description: true,
      hostName: true,
      tags: true,
    },
    buildSource: (row: any): PodcastEmbeddingSource => ({
      title: row.title,
      subtitle: cleanNullableString(row.subtitle),
      description: cleanNullableString(row.description),
      hostName: cleanNullableString(row.hostName),
      tags: normalizeStringList(row.tags),
    }),
    buildText: (source: PodcastEmbeddingSource) =>
      renderLines([
        'entity: podcast',
        `title: ${source.title}`,
        source.subtitle ? `subtitle: ${source.subtitle}` : undefined,
        source.hostName ? `host: ${source.hostName}` : undefined,
        source.description ? `description: ${source.description}` : undefined,
        renderStringList('tags', source.tags),
      ]),
  },
  episode: {
    entity: 'episode',
    version: 1,
    sourceSchema: EpisodeEmbeddingSourceSchema,
    select: {
      title: true,
      publishedSummary: true,
      summary: true,
      description: true,
      keyTakeaways: true,
      topicPrimary: true,
      topicSecondary: true,
      topicConcepts: true,
    },
    buildSource: (row: any): EpisodeEmbeddingSource => ({
      title: row.title,
      publishedSummary: cleanNullableString(row.publishedSummary),
      summary: cleanNullableString(row.summary),
      description: cleanNullableString(row.description),
      keyTakeaways: normalizeStringList(row.keyTakeaways),
      topicPrimary: cleanNullableString(row.topicPrimary),
      topicSecondary: normalizeStringList(row.topicSecondary),
      topicConcepts: normalizeStringList(row.topicConcepts),
    }),
    buildText: (source: EpisodeEmbeddingSource) =>
      renderLines([
        'entity: episode',
        `title: ${source.title}`,
        source.publishedSummary ? `published summary: ${source.publishedSummary}` : undefined,
        source.summary ? `summary: ${source.summary}` : undefined,
        source.description ? `description: ${source.description}` : undefined,
        renderStringList('key takeaways', source.keyTakeaways),
        source.topicPrimary ? `primary topic: ${source.topicPrimary}` : undefined,
        renderStringList('secondary topics', source.topicSecondary),
        renderStringList('topic concepts', source.topicConcepts),
      ]),
  },
  claim: {
    entity: 'claim',
    version: 1,
    sourceSchema: ClaimEmbeddingSourceSchema,
    select: {
      text: true,
      evidenceExcerpt: true,
      claimType: true,
      stance: true,
      claimConfidence: true,
    },
    buildSource: (row: any): ClaimEmbeddingSource => ({
      text: row.text,
      evidenceExcerpt: cleanNullableString(row.evidenceExcerpt),
      claimType: cleanNullableString(row.claimType),
      stance: cleanNullableString(row.stance),
      claimConfidence: cleanNullableString(row.claimConfidence),
    }),
    buildText: (source: ClaimEmbeddingSource) =>
      renderLines([
        'entity: claim',
        `text: ${source.text}`,
        source.claimType ? `claim type: ${source.claimType}` : undefined,
        source.stance ? `stance: ${source.stance}` : undefined,
        source.claimConfidence ? `confidence: ${source.claimConfidence}` : undefined,
        source.evidenceExcerpt ? `evidence excerpt: ${source.evidenceExcerpt}` : undefined,
      ]),
  },
  person: {
    entity: 'person',
    version: 1,
    sourceSchema: PersonEmbeddingSourceSchema,
    select: {
      fullName: true,
      title: true,
      bio: true,
      aliases: true,
      expertiseAreas: true,
    },
    buildSource: (row: any): PersonEmbeddingSource => ({
      fullName: row.fullName,
      title: cleanNullableString(row.title),
      bio: cleanNullableString(row.bio),
      aliases: normalizeStringList(row.aliases),
      expertiseAreas: normalizeStringList(row.expertiseAreas),
    }),
    buildText: (source: PersonEmbeddingSource) =>
      renderLines([
        'entity: person',
        `full name: ${source.fullName}`,
        source.title ? `title: ${source.title}` : undefined,
        source.bio ? `bio: ${source.bio}` : undefined,
        renderStringList('aliases', source.aliases),
        renderStringList('expertise areas', source.expertiseAreas),
      ]),
  },
  organization: {
    entity: 'organization',
    version: 1,
    sourceSchema: OrganizationEmbeddingSourceSchema,
    select: {
      name: true,
      legalName: true,
      description: true,
      organizationType: true,
      aliases: true,
      domains: true,
    },
    buildSource: (row: any): OrganizationEmbeddingSource => ({
      name: row.name,
      legalName: cleanNullableString(row.legalName),
      description: cleanNullableString(row.description),
      organizationType: cleanNullableString(row.organizationType),
      aliases: normalizeStringList(row.aliases),
      domains: normalizeStringList(row.domains),
    }),
    buildText: (source: OrganizationEmbeddingSource) =>
      renderLines([
        'entity: organization',
        `name: ${source.name}`,
        source.legalName ? `legal name: ${source.legalName}` : undefined,
        source.organizationType ? `organization type: ${source.organizationType}` : undefined,
        source.description ? `description: ${source.description}` : undefined,
        renderStringList('aliases', source.aliases),
        renderStringList('domains', source.domains),
      ]),
  },
  product: {
    entity: 'product',
    version: 1,
    sourceSchema: ProductEmbeddingSourceSchema,
    select: {
      name: true,
      category: true,
      description: true,
      recommendedUse: true,
      benefits: true,
      containsCompounds: {
        select: {
          name: true,
          slug: true,
        },
      },
      labTests: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    buildSource: (row: any): ProductEmbeddingSource => ({
      name: row.name,
      category: cleanNullableString(row.category),
      description: cleanNullableString(row.description),
      recommendedUse: cleanNullableString(row.recommendedUse),
      benefits: normalizeStringList(row.benefits),
      compounds: normalizeNamedRefs(row.containsCompounds),
      labTests: normalizeNamedRefs(row.labTests),
    }),
    buildText: (source: ProductEmbeddingSource) =>
      renderLines([
        'entity: product',
        `name: ${source.name}`,
        source.category ? `category: ${source.category}` : undefined,
        source.description ? `description: ${source.description}` : undefined,
        source.recommendedUse ? `recommended use: ${source.recommendedUse}` : undefined,
        renderStringList('benefits', source.benefits),
        renderNamedRefList('compounds', source.compounds),
        renderNamedRefList('lab tests', source.labTests),
      ]),
  },
  compound: {
    entity: 'compound',
    version: 1,
    sourceSchema: CompoundEmbeddingSourceSchema,
    select: {
      name: true,
      canonicalName: true,
      description: true,
      aliases: true,
      mechanisms: true,
    },
    buildSource: (row: any): CompoundEmbeddingSource => ({
      name: row.name,
      canonicalName: cleanNullableString(row.canonicalName),
      description: cleanNullableString(row.description),
      aliases: normalizeStringList(row.aliases),
      mechanisms: normalizeStringList(row.mechanisms),
    }),
    buildText: (source: CompoundEmbeddingSource) =>
      renderLines([
        'entity: compound',
        `name: ${source.name}`,
        source.canonicalName ? `canonical name: ${source.canonicalName}` : undefined,
        source.description ? `description: ${source.description}` : undefined,
        renderStringList('aliases', source.aliases),
        renderStringList('mechanisms', source.mechanisms),
      ]),
  },
  labTest: {
    entity: 'labTest',
    version: 1,
    sourceSchema: LabTestEmbeddingSourceSchema,
    select: {
      name: true,
      description: true,
      labName: true,
      sampleType: true,
      testsBiomarkers: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    buildSource: (row: any): LabTestEmbeddingSource => ({
      name: row.name,
      description: cleanNullableString(row.description),
      labName: cleanNullableString(row.labName),
      sampleType: cleanNullableString(row.sampleType),
      biomarkers: normalizeNamedRefs(row.testsBiomarkers),
    }),
    buildText: (source: LabTestEmbeddingSource) =>
      renderLines([
        'entity: lab test',
        `name: ${source.name}`,
        source.labName ? `lab name: ${source.labName}` : undefined,
        source.sampleType ? `sample type: ${source.sampleType}` : undefined,
        source.description ? `description: ${source.description}` : undefined,
        renderNamedRefList('biomarkers', source.biomarkers),
      ]),
  },
  biomarker: {
    entity: 'biomarker',
    version: 1,
    sourceSchema: BiomarkerEmbeddingSourceSchema,
    select: {
      name: true,
      description: true,
      category: true,
      unit: true,
      referenceRange: true,
      referenceAgeMin: true,
      referenceAgeMax: true,
      referenceRangeLow: true,
      referenceRangeMax: true,
      aliases: true,
      relatedSystems: true,
    },
    buildSource: (row: any): BiomarkerEmbeddingSource => ({
      name: row.name,
      description: cleanNullableString(row.description),
      category: cleanNullableString(row.category),
      unit: cleanNullableString(row.unit),
      referenceRange: cleanNullableString(row.referenceRange),
      referenceAgeMin: row.referenceAgeMin ?? null,
      referenceAgeMax: row.referenceAgeMax ?? null,
      referenceRangeLow: row.referenceRangeLow ?? null,
      referenceRangeMax: row.referenceRangeMax ?? null,
      aliases: normalizeStringList(row.aliases),
      relatedSystems: normalizeStringList(row.relatedSystems),
    }),
    buildText: (source: BiomarkerEmbeddingSource) =>
      renderLines([
        'entity: biomarker',
        `name: ${source.name}`,
        source.category ? `category: ${source.category}` : undefined,
        source.unit ? `unit: ${source.unit}` : undefined,
        source.description ? `description: ${source.description}` : undefined,
        renderBiomarkerRange(source),
        renderStringList('aliases', source.aliases),
        renderStringList('related systems', source.relatedSystems),
      ]),
  },
  caseStudy: {
    entity: 'caseStudy',
    version: 1,
    sourceSchema: CaseStudyEmbeddingSourceSchema,
    select: {
      title: true,
      description: true,
      studyType: true,
      outcomeSummary: true,
      fullTextSummary: true,
      journal: true,
      businessSponsors: {
        select: {
          name: true,
          slug: true,
        },
      },
      referencedByOrganizations: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    buildSource: (row: any): CaseStudyEmbeddingSource => ({
      title: row.title,
      description: cleanNullableString(row.description),
      studyType: cleanNullableString(row.studyType),
      outcomeSummary: cleanNullableString(row.outcomeSummary),
      fullTextSummary: cleanNullableString(row.fullTextSummary),
      journal: cleanNullableString(row.journal),
      sponsorOrganizations: normalizeNamedRefs(row.businessSponsors),
      referencedOrganizations: normalizeNamedRefs(row.referencedByOrganizations),
    }),
    buildText: (source: CaseStudyEmbeddingSource) =>
      renderLines([
        'entity: case study',
        `title: ${source.title}`,
        source.studyType ? `study type: ${source.studyType}` : undefined,
        source.journal ? `journal: ${source.journal}` : undefined,
        source.description ? `description: ${source.description}` : undefined,
        source.outcomeSummary ? `outcome summary: ${source.outcomeSummary}` : undefined,
        source.fullTextSummary ? `full text summary: ${source.fullTextSummary}` : undefined,
        renderNamedRefList('business sponsors', source.sponsorOrganizations),
        renderNamedRefList('referenced organizations', source.referencedOrganizations),
      ]),
  },
}

export function getEmbeddingRegistryEntry<E extends EmbeddingSourceEntity>(entity: E): EmbeddingRegistryEntry<E, any, EmbeddingSourceDataMap[E]> {
  return embeddingRegistry[entity] as EmbeddingRegistryEntry<E, any, EmbeddingSourceDataMap[E]>
}
