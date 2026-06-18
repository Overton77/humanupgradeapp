export const supportedEntityTypes = [
  "EPISODE",
  "PRODUCT",
  "CLAIM",
  "CASE_STUDY",
] as const;

export type SupportedEntityType = (typeof supportedEntityTypes)[number];

export const searchModes = ["LEXICAL", "HYBRID", "SEMANTIC", "NONE"] as const;

export type McpSearchMode = (typeof searchModes)[number];

export function routeForEntity(
  entityType: SupportedEntityType,
  entity: { id?: string | null; slug?: string | null },
) {
  switch (entityType) {
    case "EPISODE":
      return entity.slug ? `/e/episodes/${entity.slug}` : undefined;
    case "PRODUCT":
      return entity.slug ? `/e/products/${entity.slug}` : undefined;
    case "CLAIM":
      return entity.id ? `/e/claims/${entity.id}` : undefined;
    case "CASE_STUDY":
      return entity.slug ? `/e/case-studies/${entity.slug}` : undefined;
  }
}

export const entityTypeGuide = [
  {
    entityType: "EPISODE",
    identifiers: ["id", "slug", "episodePageUrl"],
    routePattern: "/e/episodes/[slug]",
    relationshipFields: [
      "podcast",
      "guests",
      "sponsorOrganizations",
      "claims",
      "media",
    ],
    bestTools: ["search_humanupgrade", "get_episode_context"],
    useCases: [
      "Find podcast episodes by topic, guest, product, biomarker, or claim language.",
      "Gather episode context before extracting entities from transcripts or summaries.",
    ],
  },
  {
    entityType: "PRODUCT",
    identifiers: ["id", "slug"],
    routePattern: "/e/products/[slug]",
    relationshipFields: ["organization", "containsCompounds", "labTests", "media"],
    bestTools: ["search_humanupgrade", "get_product_context"],
    useCases: [
      "Build evidence-backed product records.",
      "Connect sponsors, companies, compounds, lab tests, and benefits.",
    ],
  },
  {
    entityType: "CLAIM",
    identifiers: ["id"],
    routePattern: "/e/claims/[id]",
    relationshipFields: ["episode", "speaker", "media"],
    bestTools: ["search_humanupgrade", "get_claim_context"],
    useCases: [
      "Verify podcast claims against internal and external evidence.",
      "Recover quote, timestamp, speaker, and episode context.",
    ],
  },
  {
    entityType: "CASE_STUDY",
    identifiers: ["id", "slug"],
    routePattern: "/e/case-studies/[slug]",
    relationshipFields: ["businessSponsors", "referencedByOrganizations", "media"],
    bestTools: ["search_humanupgrade", "get_case_study_context"],
    useCases: [
      "Inspect evidence objects attached to products, organizations, and claims.",
      "Analyze study design, outcomes, limitations, DOI, and source URL.",
    ],
  },
] satisfies Array<{
  entityType: SupportedEntityType;
  identifiers: string[];
  routePattern: string;
  relationshipFields: string[];
  bestTools: string[];
  useCases: string[];
}>;
