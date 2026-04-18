import type { PrismaClient } from "../../generated/client.js";
import { embedTextBedrock } from "./embeddings/bedrockEmbeddingClient.js";
import { getEmbeddingEntityDelegate } from "./embeddings/entityMetadata.js";
import type { EmbeddingSourceEntity } from "./embeddings/types.js";
import {
  getEntitySearchConfig,
  type EntitySearchConfig,
} from "./entitySearchConfig.js";
import type {
  BaseSearchInput,
  BiomarkerSearchInput,
  BiomarkerSearchResult,
  CaseStudySearchInput,
  CaseStudySearchResult,
  ClaimSearchInput,
  ClaimSearchResult,
  CompoundSearchInput,
  CompoundSearchResult,
  EpisodeSearchInput,
  EpisodeSearchResult,
  LabTestSearchInput,
  LabTestSearchResult,
  NormalizedSearchInput,
  OrganizationSearchInput,
  OrganizationSearchResult,
  PersonSearchInput,
  PersonSearchResult,
  PodcastSearchInput,
  PodcastSearchResult,
  ProductSearchInput,
  ProductSearchResult,
  SearchInputMap,
  SearchMode,
  SearchRecordMap,
  SearchResultForEntity,
  SearchResultKeyMap,
  SearchRow,
} from "./entitySearchTypes.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const HYBRID_RESULT_CANDIDATE_LIMIT = 50;
const HYBRID_TOTAL_CANDIDATE_LIMIT = 200;
const QUERY_EMBEDDING_MODEL = "cohere.embed-v4:0";
const QUERY_EMBEDDING_DIMENSIONS = 1536;

type CountRow = {
  count: bigint;
};

type SearchRecordWithId = {
  id: string;
};

function normalizeSearchMode(mode?: SearchMode | null): SearchMode {
  return mode ?? "NONE";
}

function normalizeQuery(query?: string | null): string | null {
  const trimmed = query?.trim();
  return trimmed ? trimmed : null;
}

/**
 * - `undefined` (field omitted): use {@link DEFAULT_LIMIT}.
 * - `null`: no limit — return every row that matches (subject to offset).
 * - number: clamped to [1, {@link MAX_LIMIT}].
 */
function normalizeLimit(limit?: number | null): number | null {
  if (limit === null) {
    return null;
  }
  if (limit === undefined) {
    return DEFAULT_LIMIT;
  }
  return Math.max(1, Math.min(limit, MAX_LIMIT));
}

function normalizeOffset(offset?: number | null): number {
  return Math.max(0, offset ?? 0);
}

function normalizeSearchInput<T extends BaseSearchInput>(
  input?: T | null,
): NormalizedSearchInput<T> {
  const safeInput = (input ?? {}) as T;

  return {
    ...(safeInput as Omit<T, "mode" | "query" | "limit" | "offset">),
    mode: normalizeSearchMode(safeInput.mode),
    query: normalizeQuery(safeInput.query),
    limit: normalizeLimit(safeInput.limit),
    offset: normalizeOffset(safeInput.offset),
  } as NormalizedSearchInput<T>;
}

function assertModeRequirements(mode: SearchMode, query: string | null) {
  switch (mode) {
    case "NONE":
      return;
    case "LEXICAL":
    case "SEMANTIC":
    case "HYBRID":
      if (!query) {
        throw new Error(`${mode} search requires a non-empty query`);
      }
      return;
    default: {
      const exhaustiveCheck: never = mode;
      throw new Error(`Unsupported search mode: ${exhaustiveCheck}`);
    }
  }
}

function createSqlBinder() {
  const values: unknown[] = [];

  return {
    values,
    bind(value: unknown) {
      values.push(value);
      return `$${values.length}`;
    },
  };
}

function renderAndClauses(clauses: string[]): string {
  if (!clauses.length) return "";
  return `\n      AND ${clauses.join("\n      AND ")}`;
}

/** PostgreSQL: omit LIMIT when unlimited; OFFSET alone is valid. */
function renderLimitOffsetSql(
  rowBinder: ReturnType<typeof createSqlBinder>,
  limit: number | null,
  offset: number,
): string {
  const offsetParam = rowBinder.bind(offset);
  if (limit == null) {
    return `OFFSET ${offsetParam}`;
  }
  const limitParam = rowBinder.bind(limit);
  return `LIMIT ${limitParam}\n    OFFSET ${offsetParam}`;
}

function toPgVectorLiteral(embedding: number[]): string {
  if (!embedding.length) {
    throw new Error("Embedding vector cannot be empty");
  }

  for (const value of embedding) {
    if (!Number.isFinite(value)) {
      throw new Error("Embedding vector contains a non-finite value");
    }
  }

  return `[${embedding.join(",")}]`;
}

async function resolveQueryEmbedding(
  mode: SearchMode,
  query: string | null,
): Promise<number[] | null> {
  if (mode !== "SEMANTIC" && mode !== "HYBRID") {
    return null;
  }

  if (!query) {
    throw new Error(`${mode} search requires a non-empty query`);
  }

  return embedTextBedrock(query, {
    modelId: QUERY_EMBEDDING_MODEL,
    dimensions: QUERY_EMBEDDING_DIMENSIONS,
    inputType: "search_query",
  });
}

async function hydrateRows<E extends EmbeddingSourceEntity>(
  prisma: PrismaClient,
  config: EntitySearchConfig<E>,
  rows: SearchRow[],
  total: number,
): Promise<SearchResultForEntity<E>> {
  if (!rows.length) {
    return { items: [], total } as SearchResultForEntity<E>;
  }

  const idsInOrder = rows.map((row) => row.id);
  const delegate = getEmbeddingEntityDelegate(prisma, config.entity);
  const records = (await delegate.findMany({
    where: {
      id: { in: idsInOrder },
    },
  })) as Array<SearchRecordWithId & SearchRecordMap[E]>;

  const byId = new Map(records.map((record) => [record.id, record]));

  return {
    total,
    items: rows
      .map((row) => {
        const record = byId.get(row.id);
        if (!record) return null;

        return {
          [config.resultKey]: record,
          lexicalScore: row.lexicalScore,
          semanticScore: row.semanticScore,
          hybridScore: row.hybridScore,
        } as Record<SearchResultKeyMap[E], SearchRecordMap[E]> & {
          lexicalScore: number | null;
          semanticScore: number | null;
          hybridScore: number | null;
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null),
  } as SearchResultForEntity<E>;
}

async function searchNone<E extends EmbeddingSourceEntity>(
  prisma: PrismaClient,
  config: EntitySearchConfig<E>,
  input: NormalizedSearchInput<SearchInputMap[E]>,
): Promise<SearchResultForEntity<E>> {
  const delegate = getEmbeddingEntityDelegate(prisma, config.entity);
  const where = config.buildWhere(input);

  const [records, total] = await prisma.$transaction([
    delegate.findMany({
      where,
      orderBy: config.defaultBrowseOrderBy,
      skip: input.offset,
      ...(input.limit != null ? { take: input.limit } : {}),
    }),
    delegate.count({ where }),
  ]);

  return {
    total,
    items: (records as Array<SearchRecordMap[E]>).map((record) => ({
      [config.resultKey]: record,
      lexicalScore: null,
      semanticScore: null,
      hybridScore: null,
    })) as SearchResultForEntity<E>["items"],
  };
}

async function searchLexical<E extends EmbeddingSourceEntity>(
  prisma: PrismaClient,
  config: EntitySearchConfig<E>,
  input: NormalizedSearchInput<SearchInputMap[E]>,
): Promise<SearchResultForEntity<E>> {
  const rowBinder = createSqlBinder();
  const queryParam = rowBinder.bind(input.query);
  const rowFilterSql = renderAndClauses(
    config.buildSqlConditions(input, "t", rowBinder.bind),
  );
  const limitOffsetSql = renderLimitOffsetSql(
    rowBinder,
    input.limit,
    input.offset,
  );

  const rows = await prisma.$queryRawUnsafe<SearchRow[]>(
    `
    WITH ranked AS (
      SELECT
        t."id",
        ts_rank_cd(
          t."search_vector",
          websearch_to_tsquery('simple', ${queryParam})
        )::float AS "lexicalScore"
      FROM "${config.tableName}" t
      WHERE
        t."search_vector" @@ websearch_to_tsquery('simple', ${queryParam})${rowFilterSql}
    )
    SELECT
      r."id",
      r."lexicalScore",
      NULL::float AS "semanticScore",
      r."lexicalScore" AS "hybridScore"
    FROM ranked r
    ORDER BY r."lexicalScore" DESC, r."id" ASC
    ${limitOffsetSql};
    `,
    ...rowBinder.values,
  );

  const countBinder = createSqlBinder();
  const countQueryParam = countBinder.bind(input.query);
  const countFilterSql = renderAndClauses(
    config.buildSqlConditions(input, "t", countBinder.bind),
  );

  const totalRows = await prisma.$queryRawUnsafe<CountRow[]>(
    `
    SELECT COUNT(*)::bigint AS count
    FROM "${config.tableName}" t
    WHERE
      t."search_vector" @@ websearch_to_tsquery('simple', ${countQueryParam})${countFilterSql};
    `,
    ...countBinder.values,
  );

  return hydrateRows(prisma, config, rows, Number(totalRows[0]?.count ?? 0n));
}

async function searchSemantic<E extends EmbeddingSourceEntity>(
  prisma: PrismaClient,
  config: EntitySearchConfig<E>,
  input: NormalizedSearchInput<SearchInputMap[E]>,
  embedding: number[],
): Promise<SearchResultForEntity<E>> {
  const vectorLiteral = toPgVectorLiteral(embedding);

  const rowBinder = createSqlBinder();
  const vectorParam = rowBinder.bind(vectorLiteral);
  const rowFilterSql = renderAndClauses(
    config.buildSqlConditions(input, "t", rowBinder.bind),
  );
  const limitOffsetSql = renderLimitOffsetSql(
    rowBinder,
    input.limit,
    input.offset,
  );

  const rows = await prisma.$queryRawUnsafe<SearchRow[]>(
    `
    SELECT
      t."id",
      NULL::float AS "lexicalScore",
      (1 - (t."embedding" <=> ${vectorParam}::vector))::float AS "semanticScore",
      (1 - (t."embedding" <=> ${vectorParam}::vector))::float AS "hybridScore"
    FROM "${config.tableName}" t
    WHERE
      t."embedding" IS NOT NULL${rowFilterSql}
    ORDER BY t."embedding" <=> ${vectorParam}::vector, t."id" ASC
    ${limitOffsetSql};
    `,
    ...rowBinder.values,
  );

  const countBinder = createSqlBinder();
  const countFilterSql = renderAndClauses(
    config.buildSqlConditions(input, "t", countBinder.bind),
  );

  const totalRows = await prisma.$queryRawUnsafe<CountRow[]>(
    `
    SELECT COUNT(*)::bigint AS count
    FROM "${config.tableName}" t
    WHERE
      t."embedding" IS NOT NULL${countFilterSql};
    `,
    ...countBinder.values,
  );

  return hydrateRows(prisma, config, rows, Number(totalRows[0]?.count ?? 0n));
}

async function searchHybrid<E extends EmbeddingSourceEntity>(
  prisma: PrismaClient,
  config: EntitySearchConfig<E>,
  input: NormalizedSearchInput<SearchInputMap[E]>,
  embedding: number[],
): Promise<SearchResultForEntity<E>> {
  const vectorLiteral = toPgVectorLiteral(embedding);

  const rowBinder = createSqlBinder();
  const queryParam = rowBinder.bind(input.query);
  const vectorParam = rowBinder.bind(vectorLiteral);
  const lexicalFilterSql = renderAndClauses(
    config.buildSqlConditions(input, "l", rowBinder.bind),
  );
  const semanticFilterSql = renderAndClauses(
    config.buildSqlConditions(input, "s", rowBinder.bind),
  );
  const limitOffsetSql = renderLimitOffsetSql(
    rowBinder,
    input.limit,
    input.offset,
  );

  const rows = await prisma.$queryRawUnsafe<SearchRow[]>(
    `
    WITH lexical AS (
      SELECT
        l."id",
        ts_rank_cd(
          l."search_vector",
          websearch_to_tsquery('simple', ${queryParam})
        )::float AS lexical_score
      FROM "${config.tableName}" l
      WHERE
        l."search_vector" @@ websearch_to_tsquery('simple', ${queryParam})${lexicalFilterSql}
      ORDER BY lexical_score DESC, l."id" ASC
      LIMIT ${HYBRID_RESULT_CANDIDATE_LIMIT}
    ),
    semantic AS (
      SELECT
        s."id",
        (1 - (s."embedding" <=> ${vectorParam}::vector))::float AS semantic_score
      FROM "${config.tableName}" s
      WHERE
        s."embedding" IS NOT NULL${semanticFilterSql}
      ORDER BY s."embedding" <=> ${vectorParam}::vector, s."id" ASC
      LIMIT ${HYBRID_RESULT_CANDIDATE_LIMIT}
    ),
    merged AS (
      SELECT
        COALESCE(l."id", s."id") AS id,
        l.lexical_score,
        s.semantic_score,
        (
          COALESCE(l.lexical_score, 0) * 0.7 +
          COALESCE(s.semantic_score, 0) * 0.3
        )::float AS hybrid_score
      FROM lexical l
      FULL OUTER JOIN semantic s
        ON l."id" = s."id"
    )
    SELECT
      m.id,
      m.lexical_score AS "lexicalScore",
      m.semantic_score AS "semanticScore",
      m.hybrid_score AS "hybridScore"
    FROM merged m
    ORDER BY m.hybrid_score DESC, m.id ASC
    ${limitOffsetSql};
    `,
    ...rowBinder.values,
  );

  const countBinder = createSqlBinder();
  const countQueryParam = countBinder.bind(input.query);
  const countVectorParam = countBinder.bind(vectorLiteral);
  const countLexicalFilterSql = renderAndClauses(
    config.buildSqlConditions(input, "l", countBinder.bind),
  );
  const countSemanticFilterSql = renderAndClauses(
    config.buildSqlConditions(input, "s", countBinder.bind),
  );

  const totalRows = await prisma.$queryRawUnsafe<CountRow[]>(
    `
    WITH lexical AS (
      SELECT l."id"
      FROM "${config.tableName}" l
      WHERE
        l."search_vector" @@ websearch_to_tsquery('simple', ${countQueryParam})${countLexicalFilterSql}
      ORDER BY ts_rank_cd(
        l."search_vector",
        websearch_to_tsquery('simple', ${countQueryParam})
      ) DESC, l."id" ASC
      LIMIT ${HYBRID_TOTAL_CANDIDATE_LIMIT}
    ),
    semantic AS (
      SELECT s."id"
      FROM "${config.tableName}" s
      WHERE
        s."embedding" IS NOT NULL${countSemanticFilterSql}
      ORDER BY s."embedding" <=> ${countVectorParam}::vector, s."id" ASC
      LIMIT ${HYBRID_TOTAL_CANDIDATE_LIMIT}
    )
    SELECT COUNT(DISTINCT id)::bigint AS count
    FROM (
      SELECT "id" FROM lexical
      UNION
      SELECT "id" FROM semantic
    ) q;
    `,
    ...countBinder.values,
  );

  return hydrateRows(prisma, config, rows, Number(totalRows[0]?.count ?? 0n));
}

async function searchEntity<E extends EmbeddingSourceEntity>(
  prisma: PrismaClient,
  entity: E,
  input?: SearchInputMap[E] | null,
): Promise<SearchResultForEntity<E>> {
  const config = getEntitySearchConfig(entity);
  const normalizedInput = normalizeSearchInput(input);

  assertModeRequirements(normalizedInput.mode, normalizedInput.query);

  switch (normalizedInput.mode) {
    case "NONE":
      return searchNone(prisma, config, normalizedInput);

    case "LEXICAL":
      return searchLexical(prisma, config, normalizedInput);

    case "SEMANTIC": {
      const embedding = await resolveQueryEmbedding(
        normalizedInput.mode,
        normalizedInput.query,
      );
      return searchSemantic(prisma, config, normalizedInput, embedding!);
    }

    case "HYBRID": {
      const embedding = await resolveQueryEmbedding(
        normalizedInput.mode,
        normalizedInput.query,
      );
      return searchHybrid(prisma, config, normalizedInput, embedding!);
    }

    default: {
      const exhaustiveCheck: never = normalizedInput.mode;
      throw new Error(`Unsupported search mode: ${exhaustiveCheck}`);
    }
  }
}

export async function searchPodcasts(
  prisma: PrismaClient,
  input?: PodcastSearchInput | null,
): Promise<PodcastSearchResult> {
  return searchEntity(prisma, "podcast", input);
}

export async function searchEpisodes(
  prisma: PrismaClient,
  input?: EpisodeSearchInput | null,
): Promise<EpisodeSearchResult> {
  return searchEntity(prisma, "episode", input);
}

export async function searchClaims(
  prisma: PrismaClient,
  input?: ClaimSearchInput | null,
): Promise<ClaimSearchResult> {
  return searchEntity(prisma, "claim", input);
}

export async function searchPersons(
  prisma: PrismaClient,
  input?: PersonSearchInput | null,
): Promise<PersonSearchResult> {
  return searchEntity(prisma, "person", input);
}

export async function searchOrganizations(
  prisma: PrismaClient,
  input?: OrganizationSearchInput | null,
): Promise<OrganizationSearchResult> {
  return searchEntity(prisma, "organization", input);
}

export async function searchProducts(
  prisma: PrismaClient,
  input?: ProductSearchInput | null,
): Promise<ProductSearchResult> {
  return searchEntity(prisma, "product", input);
}

export async function searchCompounds(
  prisma: PrismaClient,
  input?: CompoundSearchInput | null,
): Promise<CompoundSearchResult> {
  return searchEntity(prisma, "compound", input);
}

export async function searchLabTests(
  prisma: PrismaClient,
  input?: LabTestSearchInput | null,
): Promise<LabTestSearchResult> {
  return searchEntity(prisma, "labTest", input);
}

export async function searchBiomarkers(
  prisma: PrismaClient,
  input?: BiomarkerSearchInput | null,
): Promise<BiomarkerSearchResult> {
  return searchEntity(prisma, "biomarker", input);
}

export async function searchCaseStudies(
  prisma: PrismaClient,
  input?: CaseStudySearchInput | null,
): Promise<CaseStudySearchResult> {
  return searchEntity(prisma, "caseStudy", input);
}

export type {
  BiomarkerSearchInput,
  BiomarkerSearchResult,
  CaseStudySearchInput,
  CaseStudySearchResult,
  ClaimSearchInput,
  ClaimSearchResult,
  CompoundSearchInput,
  CompoundSearchResult,
  EpisodeSearchInput,
  EpisodeSearchResult,
  LabTestSearchInput,
  LabTestSearchResult,
  OrganizationSearchInput,
  OrganizationSearchResult,
  PersonSearchInput,
  PersonSearchResult,
  PodcastSearchInput,
  PodcastSearchResult,
  ProductSearchInput,
  ProductSearchResult,
  SearchMode,
} from "./entitySearchTypes.js";
