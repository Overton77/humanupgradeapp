import { getEmbeddingEntityTableName } from './embeddings/entityMetadata.js'
import type { EmbeddingSourceEntity } from './embeddings/types.js'
import type {
  NormalizedSearchInput,
  SearchInputMap,
  SearchResultKeyMap,
} from './entitySearchTypes.js'

export type SqlValueBinder = (value: unknown) => string

export type EntitySearchConfig<E extends EmbeddingSourceEntity> = {
  entity: E
  resultKey: SearchResultKeyMap[E]
  tableName: string
  defaultBrowseOrderBy: any
  buildBrowseOrderSql: (alias: string) => string
  buildWhere: (input: NormalizedSearchInput<SearchInputMap[E]>) => Record<string, unknown>
  buildSqlConditions: (
    input: NormalizedSearchInput<SearchInputMap[E]>,
    alias: string,
    bind: SqlValueBinder,
  ) => string[]
}

function normalizeStringFilter(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function pickDefined(value: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  )
}

function pushEqualityCondition(
  clauses: string[],
  alias: string,
  column: string,
  value: unknown,
  bind: SqlValueBinder,
) {
  if (value === undefined || value === null) return
  clauses.push(`${alias}."${column}" = ${bind(value)}`)
}

function buildStringFilterCondition(
  clauses: string[],
  alias: string,
  column: string,
  value: string | null | undefined,
  bind: SqlValueBinder,
) {
  const normalized = normalizeStringFilter(value)
  if (!normalized) return
  clauses.push(`${alias}."${column}" = ${bind(normalized)}`)
}

function defineEntitySearchConfig<E extends EmbeddingSourceEntity>(
  config: Omit<EntitySearchConfig<E>, 'tableName'>,
): EntitySearchConfig<E> {
  return {
    ...config,
    tableName: getEmbeddingEntityTableName(config.entity),
  }
}

export const entitySearchConfigs: {
  [E in EmbeddingSourceEntity]: EntitySearchConfig<E>
} = {
  podcast: defineEntitySearchConfig({
    entity: 'podcast',
    resultKey: 'podcast',
    defaultBrowseOrderBy: [{ title: 'asc' }, { id: 'asc' }],
    buildBrowseOrderSql: (alias) => `${alias}."title" ASC, ${alias}."id" ASC`,
    buildWhere: (input) =>
      pickDefined({
        isPublished: input.isPublished ?? undefined,
        language: normalizeStringFilter(input.language),
      }),
    buildSqlConditions: (input, alias, bind) => {
      const clauses: string[] = []
      pushEqualityCondition(clauses, alias, 'isPublished', input.isPublished, bind)
      buildStringFilterCondition(clauses, alias, 'language', input.language, bind)
      return clauses
    },
  }),

  episode: defineEntitySearchConfig({
    entity: 'episode',
    resultKey: 'episode',
    defaultBrowseOrderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
    buildBrowseOrderSql: (alias) =>
      `${alias}."publishedAt" DESC NULLS LAST, ${alias}."id" ASC`,
    buildWhere: (input) =>
      pickDefined({
        podcastId: input.podcastId ?? undefined,
        isPublished: input.isPublished ?? undefined,
        publishStatus: input.publishStatus ?? undefined,
        transcriptStatus: input.transcriptStatus ?? undefined,
        episodeNumber: input.episodeNumber ?? undefined,
        seasonNumber: input.seasonNumber ?? undefined,
      }),
    buildSqlConditions: (input, alias, bind) => {
      const clauses: string[] = []
      pushEqualityCondition(clauses, alias, 'podcastId', input.podcastId, bind)
      pushEqualityCondition(clauses, alias, 'isPublished', input.isPublished, bind)
      pushEqualityCondition(clauses, alias, 'publishStatus', input.publishStatus, bind)
      pushEqualityCondition(
        clauses,
        alias,
        'transcriptStatus',
        input.transcriptStatus,
        bind,
      )
      pushEqualityCondition(clauses, alias, 'episodeNumber', input.episodeNumber, bind)
      pushEqualityCondition(clauses, alias, 'seasonNumber', input.seasonNumber, bind)
      return clauses
    },
  }),

  claim: defineEntitySearchConfig({
    entity: 'claim',
    resultKey: 'claim',
    defaultBrowseOrderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    buildBrowseOrderSql: (alias) => `${alias}."createdAt" DESC, ${alias}."id" ASC`,
    buildWhere: (input) =>
      pickDefined({
        episodeId: input.episodeId ?? undefined,
        speakerId: input.speakerId ?? undefined,
        claimType: input.claimType ?? undefined,
        stance: input.stance ?? undefined,
        claimConfidence: input.claimConfidence ?? undefined,
      }),
    buildSqlConditions: (input, alias, bind) => {
      const clauses: string[] = []
      pushEqualityCondition(clauses, alias, 'episodeId', input.episodeId, bind)
      pushEqualityCondition(clauses, alias, 'speakerId', input.speakerId, bind)
      pushEqualityCondition(clauses, alias, 'claimType', input.claimType, bind)
      pushEqualityCondition(clauses, alias, 'stance', input.stance, bind)
      pushEqualityCondition(
        clauses,
        alias,
        'claimConfidence',
        input.claimConfidence,
        bind,
      )
      return clauses
    },
  }),

  person: defineEntitySearchConfig({
    entity: 'person',
    resultKey: 'person',
    defaultBrowseOrderBy: [{ fullName: 'asc' }, { id: 'asc' }],
    buildBrowseOrderSql: (alias) => `${alias}."fullName" ASC, ${alias}."id" ASC`,
    buildWhere: (input) =>
      pickDefined({
        title: normalizeStringFilter(input.title),
      }),
    buildSqlConditions: (input, alias, bind) => {
      const clauses: string[] = []
      buildStringFilterCondition(clauses, alias, 'title', input.title, bind)
      return clauses
    },
  }),

  organization: defineEntitySearchConfig({
    entity: 'organization',
    resultKey: 'organization',
    defaultBrowseOrderBy: [{ name: 'asc' }, { id: 'asc' }],
    buildBrowseOrderSql: (alias) => `${alias}."name" ASC, ${alias}."id" ASC`,
    buildWhere: (input) =>
      pickDefined({
        organizationType: input.organizationType ?? undefined,
      }),
    buildSqlConditions: (input, alias, bind) => {
      const clauses: string[] = []
      pushEqualityCondition(
        clauses,
        alias,
        'organizationType',
        input.organizationType,
        bind,
      )
      return clauses
    },
  }),

  product: defineEntitySearchConfig({
    entity: 'product',
    resultKey: 'product',
    defaultBrowseOrderBy: [{ name: 'asc' }, { id: 'asc' }],
    buildBrowseOrderSql: (alias) => `${alias}."name" ASC, ${alias}."id" ASC`,
    buildWhere: (input) =>
      pickDefined({
        organizationId: input.organizationId ?? undefined,
        isActive: input.isActive ?? undefined,
        isLabTestPanelDefinition: input.isLabTestPanelDefinition ?? undefined,
        category: normalizeStringFilter(input.category),
        currency: normalizeStringFilter(input.currency),
      }),
    buildSqlConditions: (input, alias, bind) => {
      const clauses: string[] = []
      pushEqualityCondition(clauses, alias, 'organizationId', input.organizationId, bind)
      pushEqualityCondition(clauses, alias, 'isActive', input.isActive, bind)
      pushEqualityCondition(
        clauses,
        alias,
        'isLabTestPanelDefinition',
        input.isLabTestPanelDefinition,
        bind,
      )
      buildStringFilterCondition(clauses, alias, 'category', input.category, bind)
      buildStringFilterCondition(clauses, alias, 'currency', input.currency, bind)
      return clauses
    },
  }),

  compound: defineEntitySearchConfig({
    entity: 'compound',
    resultKey: 'compound',
    defaultBrowseOrderBy: [{ name: 'asc' }, { id: 'asc' }],
    buildBrowseOrderSql: (alias) => `${alias}."name" ASC, ${alias}."id" ASC`,
    buildWhere: (input) =>
      pickDefined({
        externalRef: normalizeStringFilter(input.externalRef),
      }),
    buildSqlConditions: (input, alias, bind) => {
      const clauses: string[] = []
      buildStringFilterCondition(clauses, alias, 'externalRef', input.externalRef, bind)
      return clauses
    },
  }),

  labTest: defineEntitySearchConfig({
    entity: 'labTest',
    resultKey: 'labTest',
    defaultBrowseOrderBy: [{ name: 'asc' }, { id: 'asc' }],
    buildBrowseOrderSql: (alias) => `${alias}."name" ASC, ${alias}."id" ASC`,
    buildWhere: (input) =>
      pickDefined({
        productId: input.productId ?? undefined,
        organizationId: input.organizationId ?? undefined,
        sampleType: normalizeStringFilter(input.sampleType),
        labName: normalizeStringFilter(input.labName),
      }),
    buildSqlConditions: (input, alias, bind) => {
      const clauses: string[] = []
      pushEqualityCondition(clauses, alias, 'productId', input.productId, bind)
      pushEqualityCondition(clauses, alias, 'organizationId', input.organizationId, bind)
      buildStringFilterCondition(clauses, alias, 'sampleType', input.sampleType, bind)
      buildStringFilterCondition(clauses, alias, 'labName', input.labName, bind)
      return clauses
    },
  }),

  biomarker: defineEntitySearchConfig({
    entity: 'biomarker',
    resultKey: 'biomarker',
    defaultBrowseOrderBy: [{ name: 'asc' }, { id: 'asc' }],
    buildBrowseOrderSql: (alias) => `${alias}."name" ASC, ${alias}."id" ASC`,
    buildWhere: (input) =>
      pickDefined({
        unit: normalizeStringFilter(input.unit),
        category: normalizeStringFilter(input.category),
      }),
    buildSqlConditions: (input, alias, bind) => {
      const clauses: string[] = []
      buildStringFilterCondition(clauses, alias, 'unit', input.unit, bind)
      buildStringFilterCondition(clauses, alias, 'category', input.category, bind)
      return clauses
    },
  }),

  caseStudy: defineEntitySearchConfig({
    entity: 'caseStudy',
    resultKey: 'caseStudy',
    defaultBrowseOrderBy: [{ title: 'asc' }, { id: 'asc' }],
    buildBrowseOrderSql: (alias) => `${alias}."title" ASC, ${alias}."id" ASC`,
    buildWhere: (input) =>
      pickDefined({
        studyType: normalizeStringFilter(input.studyType),
        journal: normalizeStringFilter(input.journal),
        doi: normalizeStringFilter(input.doi),
      }),
    buildSqlConditions: (input, alias, bind) => {
      const clauses: string[] = []
      buildStringFilterCondition(clauses, alias, 'studyType', input.studyType, bind)
      buildStringFilterCondition(clauses, alias, 'journal', input.journal, bind)
      buildStringFilterCondition(clauses, alias, 'doi', input.doi, bind)
      return clauses
    },
  }),
}

export function getEntitySearchConfig<E extends EmbeddingSourceEntity>(
  entity: E,
): EntitySearchConfig<E> {
  return entitySearchConfigs[entity]
}
