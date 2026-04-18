import type { PrismaClient } from "../../../generated/client.js";
import {
  searchBiomarkers,
  searchCaseStudies,
  searchClaims,
  searchCompounds,
  searchEpisodes,
  searchLabTests,
  searchOrganizations,
  searchPersons,
  searchPodcasts,
  searchProducts,
} from "../../search/entitySearchService.js";

/**
 * Public-facing input for the global multi-entity search resolver.
 * Mirrors the GraphQL `GlobalSearchInput` shape.
 */
export type GlobalSearchInput = {
  query: string;
  mode?: "NONE" | "LEXICAL" | "SEMANTIC" | "HYBRID" | null;
  perTypeLimit?: number | null;
  /** Entity buckets to query. Omit / null => all. */
  types?: GlobalSearchEntityType[] | null;
};

export type GlobalSearchEntityType =
  | "PODCAST"
  | "EPISODE"
  | "CLAIM"
  | "PERSON"
  | "ORGANIZATION"
  | "PRODUCT"
  | "COMPOUND"
  | "LAB_TEST"
  | "BIOMARKER"
  | "CASE_STUDY";

const DEFAULT_PER_TYPE_LIMIT = 5;
const ALL_TYPES: GlobalSearchEntityType[] = [
  "PODCAST",
  "EPISODE",
  "CLAIM",
  "PERSON",
  "ORGANIZATION",
  "PRODUCT",
  "COMPOUND",
  "LAB_TEST",
  "BIOMARKER",
  "CASE_STUDY",
];

/**
 * Empty result shape that mirrors the per-entity SearchResult contract.
 * Used to short-circuit buckets the caller didn't ask for, so the GraphQL
 * response shape stays stable regardless of `types` filter.
 */
const empty = <T>() => ({ items: [] as T[], total: 0 });

/**
 * Run the global multi-entity search. Fans out to each enabled bucket in
 * parallel; isolates failures per bucket so one slow / failing entity type
 * doesn't kill the whole response.
 */
export async function runGlobalSearch(
  prisma: PrismaClient,
  input: GlobalSearchInput,
) {
  const query = input.query?.trim() ?? "";
  const mode = input.mode ?? "HYBRID";
  const limit = input.perTypeLimit ?? DEFAULT_PER_TYPE_LIMIT;
  const requested = new Set<GlobalSearchEntityType>(input.types ?? ALL_TYPES);

  const enabled = (t: GlobalSearchEntityType) => requested.has(t);

  // Fan out — Promise.all keeps it parallel; settled-style guards isolate failures.
  const [
    podcasts,
    episodes,
    claims,
    persons,
    organizations,
    products,
    compounds,
    labTests,
    biomarkers,
    caseStudies,
  ] = await Promise.all([
    enabled("PODCAST")      ? searchPodcasts(prisma,      { mode, query, limit }).catch(emptyResolver) : empty(),
    enabled("EPISODE")      ? searchEpisodes(prisma,      { mode, query, limit }).catch(emptyResolver) : empty(),
    enabled("CLAIM")        ? searchClaims(prisma,        { mode, query, limit }).catch(emptyResolver) : empty(),
    enabled("PERSON")       ? searchPersons(prisma,       { mode, query, limit }).catch(emptyResolver) : empty(),
    enabled("ORGANIZATION") ? searchOrganizations(prisma, { mode, query, limit }).catch(emptyResolver) : empty(),
    enabled("PRODUCT")      ? searchProducts(prisma,      { mode, query, limit }).catch(emptyResolver) : empty(),
    enabled("COMPOUND")     ? searchCompounds(prisma,     { mode, query, limit }).catch(emptyResolver) : empty(),
    enabled("LAB_TEST")     ? searchLabTests(prisma,      { mode, query, limit }).catch(emptyResolver) : empty(),
    enabled("BIOMARKER")    ? searchBiomarkers(prisma,    { mode, query, limit }).catch(emptyResolver) : empty(),
    enabled("CASE_STUDY")   ? searchCaseStudies(prisma,   { mode, query, limit }).catch(emptyResolver) : empty(),
  ]);

  const totalAcrossTypes =
    podcasts.total +
    episodes.total +
    claims.total +
    persons.total +
    organizations.total +
    products.total +
    compounds.total +
    labTests.total +
    biomarkers.total +
    caseStudies.total;

  return {
    query,
    podcasts,
    episodes,
    claims,
    persons,
    organizations,
    products,
    compounds,
    labTests,
    biomarkers,
    caseStudies,
    totalAcrossTypes,
  };
}

/** Single-bucket failure handler: log + return empty so the response shape stays valid. */
function emptyResolver(err: unknown) {
  console.error("[globalSearch] bucket failed:", err);
  return empty();
}
