import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import {
  searchCaseStudies,
  searchClaims,
  searchEpisodes,
  searchProducts,
} from "../search/entitySearchService.js";
import type { SearchMode } from "../search/entitySearchTypes.js";
import { entityTypeGuide, routeForEntity, searchModes, supportedEntityTypes, type SupportedEntityType } from "./entityMetadata.js";
import { executeMcpGraphql } from "./graphqlExecutor.js";
import { jsonToolResult, resourceText } from "./format.js";
import { searchSchemaIndex } from "./schemaIndex.js";

const SERVER_INSTRUCTIONS = [
  "HumanUpgrade MCP exposes focused, read-only tools for Dave Asprey / Human Upgrade podcast knowledge.",
  "Start with search_humanupgrade unless you already have an entity id or slug.",
  "Use get_*_context tools after search to fetch relationship-rich context through GraphQL resolvers and DataLoaders.",
  "Use search_schema when you need to understand available fields, inputs, models, or relationships before choosing a query.",
  "Do not treat results as medical advice. Ground claims in cited episodes, claims, products, and case studies.",
].join("\n");

const EPISODE_CONTEXT_QUERY = /* GraphQL */ `
  query McpEpisodeContext($id: ID, $slug: String, $episodePageUrl: String) {
    episode(id: $id, slug: $slug, episodePageUrl: $episodePageUrl) {
      id
      slug
      title
      episodeNumber
      seasonNumber
      channelName
      summary
      description
      publishedAt
      durationSeconds
      isPublished
      webPageSummary
      summaryShort
      summaryDetailed
      publishedSummary
      episodePageUrl
      episodeTranscriptUrl
      youtubeWatchUrl
      transcriptStatus
      publishStatus
      topicPrimary
      topicSecondary
      topicConcepts
      tags
      keyTakeaways
      topics
      podcast {
        id
        slug
        title
        hostName
        websiteUrl
      }
      guests {
        id
        slug
        fullName
        title
        bio
        websiteUrl
        expertiseAreas
      }
      sponsorOrganizations {
        id
        slug
        name
        description
        websiteUrl
        organizationType
        tags
      }
      claims {
        id
        text
        evidenceExcerpt
        claimType
        stance
        claimConfidence
        probableSpeaker
        startTimeSeconds
        endTimeSeconds
        sourceUrl
        evidenceUrls
        tags
      }
      media {
        id
        url
        type
        mimeType
        title
        caption
        sortOrder
      }
    }
  }
`;

const PRODUCT_CONTEXT_QUERY = /* GraphQL */ `
  query McpProductContext($id: ID, $slug: String) {
    product(id: $id, slug: $slug) {
      id
      slug
      name
      recommendedUse
      description
      category
      sku
      productUrl
      price
      currency
      isActive
      isLabTestPanelDefinition
      tags
      categories
      benefits
      organization {
        id
        slug
        name
        legalName
        description
        websiteUrl
        organizationType
        tags
        domains
      }
      containsCompounds {
        id
        slug
        name
        description
        canonicalName
        aliases
        mechanisms
      }
      labTests {
        id
        slug
        name
        description
        labName
        reportUrl
        sampleType
        tags
      }
      media {
        id
        url
        type
        mimeType
        title
        caption
        sortOrder
      }
    }
  }
`;

const CLAIM_CONTEXT_QUERY = /* GraphQL */ `
  query McpClaimContext($id: ID) {
    claim(id: $id) {
      id
      text
      evidenceExcerpt
      claimType
      stance
      claimConfidence
      probableSpeaker
      startTimeSeconds
      endTimeSeconds
      sourceUrl
      evidenceUrls
      tags
      speaker {
        id
        slug
        fullName
        title
        expertiseAreas
      }
      episode {
        id
        slug
        title
        episodeNumber
        publishedAt
        episodePageUrl
        youtubeWatchUrl
        summaryShort
        topicPrimary
        topicSecondary
        podcast {
          id
          slug
          title
          hostName
        }
      }
      media {
        id
        url
        type
        mimeType
        title
        caption
      }
    }
  }
`;

const CASE_STUDY_CONTEXT_QUERY = /* GraphQL */ `
  query McpCaseStudyContext($id: ID, $slug: String) {
    caseStudy(id: $id, slug: $slug) {
      id
      slug
      title
      description
      studyType
      publicationDate
      sourceUrl
      doi
      journal
      outcomeSummary
      fullTextSummary
      tags
      keywords
      businessSponsors {
        id
        slug
        name
        description
        websiteUrl
        organizationType
        tags
      }
      referencedByOrganizations {
        id
        slug
        name
        description
        websiteUrl
        organizationType
        tags
      }
      media {
        id
        url
        type
        mimeType
        title
        caption
        sortOrder
      }
    }
  }
`;

type SearchArgs = {
  query: string;
  entityTypes?: SupportedEntityType[];
  mode?: SearchMode;
  limit?: number;
  includeHidden?: boolean;
};

function compactSearchHit(
  entityType: SupportedEntityType,
  key: string,
  hit: Record<string, unknown>,
) {
  const entity = hit[key] as
    | {
        id?: string | null;
        slug?: string | null;
        title?: string | null;
        name?: string | null;
        text?: string | null;
        summaryShort?: string | null;
        description?: string | null;
        evidenceExcerpt?: string | null;
      }
    | undefined;

  return {
    entityType,
    id: entity?.id,
    slug: entity?.slug,
    title: entity?.title ?? entity?.name ?? entity?.text,
    summary: entity?.summaryShort ?? entity?.description ?? entity?.evidenceExcerpt,
    route: entity ? routeForEntity(entityType, entity) : undefined,
    scores: {
      lexical: hit.lexicalScore,
      semantic: hit.semanticScore,
      hybrid: hit.hybridScore,
    },
  };
}

async function searchHumanUpgrade(args: SearchArgs) {
  const entityTypes = args.entityTypes?.length
    ? args.entityTypes
    : [...supportedEntityTypes];
  const mode = args.mode ?? "LEXICAL";
  const limit = Math.max(1, Math.min(args.limit ?? 5, 20));
  const includeHidden = args.includeHidden ?? false;
  const query = args.query.trim();
  const requested = new Set(entityTypes);

  const [episodes, products, claims, caseStudies] = await Promise.all([
    requested.has("EPISODE")
      ? searchEpisodes(prisma, {
          query,
          mode,
          limit,
          ...(includeHidden ? {} : { isPublished: true }),
        })
      : { items: [], total: 0 },
    requested.has("PRODUCT")
      ? searchProducts(prisma, {
          query,
          mode,
          limit,
          ...(includeHidden ? {} : { isActive: true }),
        })
      : { items: [], total: 0 },
    requested.has("CLAIM")
      ? searchClaims(prisma, { query, mode, limit })
      : { items: [], total: 0 },
    requested.has("CASE_STUDY")
      ? searchCaseStudies(prisma, { query, mode, limit })
      : { items: [], total: 0 },
  ]);

  return {
    query,
    mode,
    entityTypes,
    includeHidden,
    results: {
      episodes: {
        total: episodes.total,
        items: episodes.items.map((hit) =>
          compactSearchHit("EPISODE", "episode", hit as Record<string, unknown>),
        ),
      },
      products: {
        total: products.total,
        items: products.items.map((hit) =>
          compactSearchHit("PRODUCT", "product", hit as Record<string, unknown>),
        ),
      },
      claims: {
        total: claims.total,
        items: claims.items.map((hit) =>
          compactSearchHit("CLAIM", "claim", hit as Record<string, unknown>),
        ),
      },
      caseStudies: {
        total: caseStudies.total,
        items: caseStudies.items.map((hit) =>
          compactSearchHit("CASE_STUDY", "caseStudy", hit as Record<string, unknown>),
        ),
      },
    },
  };
}

function requireIdentifier(args: { id?: string; slug?: string; episodePageUrl?: string }) {
  if (!args.id && !args.slug && !args.episodePageUrl) {
    throw new Error("Provide at least one identifier: id, slug, or episodePageUrl.");
  }
}

function registerTools(server: McpServer) {
  server.registerTool(
    "search_humanupgrade",
    {
      title: "Search HumanUpgrade",
      description:
        "Search the HumanUpgrade knowledge graph for the focused V1 MCP entity set: episodes, products, claims, and case studies. Use this first when you have natural language like a topic, product, guest, compound, biomarker, or claim phrase. This tool returns compact hits and routes; call a get_*_context tool next for relationship-rich details. It is not for arbitrary schema discovery; use search_schema for that.",
      inputSchema: {
        query: z.string().min(1).describe(
          "Natural-language search text, such as 'HRV sleep', 'methylene blue mitochondria', a product name, or a claim phrase.",
        ),
        entityTypes: z.array(z.enum(supportedEntityTypes)).optional().describe(
          "Optional subset of entity buckets to search. Omit to search EPISODE, PRODUCT, CLAIM, and CASE_STUDY.",
        ),
        mode: z.enum(searchModes).default("LEXICAL").describe(
          "Search mode. LEXICAL is the robust default. HYBRID or SEMANTIC may use configured embedding infrastructure for richer semantic matching.",
        ),
        limit: z.number().int().min(1).max(20).default(5).describe(
          "Maximum number of hits per entity type. Keep this small, then fetch context for the most relevant hits.",
        ),
        includeHidden: z.boolean().default(false).describe(
          "When false, filters episodes/products toward public or active records where supported. Set true only for internal curation or ingestion work.",
        ),
      },
    },
    async (args) => jsonToolResult(await searchHumanUpgrade(args)),
  );

  server.registerTool(
    "get_episode_context",
    {
      title: "Get Episode Context",
      description:
        "Fetch relationship-rich context for one Human Upgrade podcast episode. Use after search_humanupgrade when you have an episode id, slug, or episodePageUrl. Returns podcast metadata, guests, sponsor organizations, claims with timestamps, media, summaries, transcript metadata, tags, and takeaways. Do not use for broad search.",
      inputSchema: {
        id: z.string().optional().describe("Episode id. Use this when a search result returned an id."),
        slug: z.string().optional().describe("Episode slug from `/e/episodes/[slug]` routes."),
        episodePageUrl: z.string().url().optional().describe(
          "Canonical Human Upgrade episode page URL, if known instead of id or slug.",
        ),
      },
    },
    async (args) => {
      requireIdentifier(args);
      const data = await executeMcpGraphql(EPISODE_CONTEXT_QUERY, args);
      return jsonToolResult(data);
    },
  );

  server.registerTool(
    "get_product_context",
    {
      title: "Get Product Context",
      description:
        "Fetch relationship-rich context for one product. Use this for evidence briefs, product carts, sponsor/product analysis, and linking products to organizations, compounds, lab tests, media, and benefits. Accepts product id or slug. Do not use for product search; use search_humanupgrade first.",
      inputSchema: {
        id: z.string().optional().describe("Product id returned by search_humanupgrade or GraphQL."),
        slug: z.string().optional().describe("Product slug from `/e/products/[slug]` routes."),
      },
    },
    async (args) => {
      requireIdentifier(args);
      const data = await executeMcpGraphql(PRODUCT_CONTEXT_QUERY, args);
      return jsonToolResult(data);
    },
  );

  server.registerTool(
    "get_claim_context",
    {
      title: "Get Claim Context",
      description:
        "Fetch one claim with its episode, speaker, evidence excerpt, timestamps, evidence URLs, tags, and classification fields. Use this before verifying or citing a claim. Requires claim id; claims do not have slugs.",
      inputSchema: {
        id: z.string().describe("Claim id returned by search_humanupgrade or an episode's claims field."),
      },
    },
    async (args) => {
      const data = await executeMcpGraphql(CLAIM_CONTEXT_QUERY, args);
      return jsonToolResult(data);
    },
  );

  server.registerTool(
    "get_case_study_context",
    {
      title: "Get Case Study Context",
      description:
        "Fetch one case study as an evidence object with DOI/source URL, journal, summaries, keywords, sponsor/referenced organizations, and media. Use this before analyzing study quality or attaching evidence to a product or claim. Accepts case study id or slug.",
      inputSchema: {
        id: z.string().optional().describe("Case study id returned by search_humanupgrade or GraphQL."),
        slug: z.string().optional().describe("Case study slug from `/e/case-studies/[slug]` routes."),
      },
    },
    async (args) => {
      requireIdentifier(args);
      const data = await executeMcpGraphql(CASE_STUDY_CONTEXT_QUERY, args);
      return jsonToolResult(data);
    },
  );

  server.registerTool(
    "search_schema",
    {
      title: "Search GraphQL And Prisma Schema",
      description:
        "Search the current HumanUpgrade GraphQL schema and Prisma schema so an agent can understand available entity fields, relationship fields, inputs, enums, and models before choosing a tool or proposing a query. Use this when you are unsure what fields exist, what can be searched, or how podcast/product/evidence entities relate. This is not a database query tool.",
      inputSchema: {
        query: z.string().min(1).describe(
          "Schema search terms, such as 'Episode claims guests', 'Product compounds', 'CaseStudy organizations', or 'GlobalSearchInput'.",
        ),
        sources: z.array(z.enum(["graphql", "prisma"])).optional().describe(
          "Schema sources to search. Omit to search both GraphQL schema.graphql and Prisma schema.prisma.",
        ),
        entityTypes: z.array(z.string()).optional().describe(
          "Optional entity/model/type names to boost, such as Episode, Product, Claim, or CaseStudy.",
        ),
        limit: z.number().int().min(1).max(20).default(8).describe(
          "Maximum schema sections to return. Keep this small unless doing schema exploration.",
        ),
      },
    },
    async (args) => jsonToolResult(searchSchemaIndex(args)),
  );

  server.registerTool(
    "list_entity_types",
    {
      title: "List Supported Entity Types",
      description:
        "Return the focused V1 MCP entity guide. Use this to learn supported entity types, accepted identifiers, route patterns, relationship fields, and which MCP tool to call next. This is a static guide, not a database search.",
    },
    async () =>
      jsonToolResult({
        supportedEntityTypes,
        entityTypeGuide,
      }),
  );
}

function registerResources(server: McpServer) {
  server.registerResource(
    "supported_entities",
    "humanupgrade://schema/entities",
    {
      title: "Supported HumanUpgrade MCP Entities",
      description:
        "Focused V1 entity guide for episodes, products, claims, and case studies.",
      mimeType: "application/json",
    },
    (uri) => resourceText(uri.toString(), JSON.stringify(entityTypeGuide, null, 2), "application/json"),
  );

  server.registerResource(
    "search_guide",
    "humanupgrade://schema/search",
    {
      title: "HumanUpgrade Search Guide",
      description:
        "Guidance for search_humanupgrade arguments, search modes, and follow-up context tools.",
      mimeType: "text/markdown",
    },
    (uri) =>
      resourceText(
        uri.toString(),
        [
          "# HumanUpgrade Search Guide",
          "",
          "- Start with `search_humanupgrade` for natural language entity discovery.",
          "- Default to `LEXICAL` for robust behavior; use `HYBRID` or `SEMANTIC` when embedding infrastructure is configured and semantic recall matters.",
          "- Keep `limit` small and call `get_episode_context`, `get_product_context`, `get_claim_context`, or `get_case_study_context` for details.",
          "- Use `search_schema` when you need to inspect fields, filters, inputs, models, or relationship names.",
        ].join("\n"),
      ),
  );

  server.registerResource(
    "graphql_schema_summary",
    "humanupgrade://schema/graphql",
    {
      title: "GraphQL Schema Summary",
      description:
        "Summary of GraphQL fields most relevant to the V1 MCP entity subset.",
      mimeType: "text/markdown",
    },
    (uri) =>
      resourceText(
        uri.toString(),
        [
          "# GraphQL Schema Summary",
          "",
          "Supported MCP context tools execute GraphQL selections over:",
          "",
          "- `Episode`: podcast, guests, sponsorOrganizations, claims, media, summaries, transcript metadata.",
          "- `Product`: organization, containsCompounds, labTests, media, benefits, product URL.",
          "- `Claim`: episode, speaker, evidenceExcerpt, timestamps, evidence URLs, classification fields.",
          "- `CaseStudy`: businessSponsors, referencedByOrganizations, media, DOI/source URL, summaries.",
          "",
          "Use `search_schema` for line-aware schema sections.",
        ].join("\n"),
      ),
  );

  server.registerResource(
    "prisma_schema_summary",
    "humanupgrade://schema/prisma",
    {
      title: "Prisma Schema Summary",
      description:
        "Summary of Prisma models relevant to the focused V1 MCP entity subset.",
      mimeType: "text/markdown",
    },
    (uri) =>
      resourceText(
        uri.toString(),
        [
          "# Prisma Schema Summary",
          "",
          "The V1 MCP server searches and contextualizes public knowledge graph records. Relevant models include `Episode`, `Product`, `Claim`, `CaseStudy`, `Organization`, `Person`, `Compound`, `LabTest`, and `Media`.",
          "",
          "Use `search_schema` with `sources: [\"prisma\"]` for exact model fields and relation names.",
        ].join("\n"),
      ),
  );

  server.registerResource(
    "podcast_graph_guide",
    "humanupgrade://graph/podcast-guide",
    {
      title: "Podcast Graph Guide",
      description:
        "How episodes, guests, sponsors, claims, products, and evidence connect.",
      mimeType: "text/markdown",
    },
    (uri) =>
      resourceText(
        uri.toString(),
        [
          "# Podcast Graph Guide",
          "",
          "Episodes are the center of the HumanUpgrade graph. Use episode context to inspect guests, sponsor organizations, claims, summaries, transcript metadata, and media. Claims preserve quoted evidence, timestamps, probable speaker, stance, confidence, and evidence URLs.",
        ].join("\n"),
      ),
  );

  server.registerResource(
    "product_evidence_guide",
    "humanupgrade://graph/product-evidence-guide",
    {
      title: "Product Evidence Guide",
      description:
        "How products, organizations, compounds, lab tests, claims, and case studies support evidence briefs.",
      mimeType: "text/markdown",
    },
    (uri) =>
      resourceText(
        uri.toString(),
        [
          "# Product Evidence Guide",
          "",
          "Product context connects a product to its organization, compounds, lab tests, benefits, URL, media, and categories. To build an evidence brief, search for claims and case studies using product/company/topic terms, then fetch claim and case study context.",
        ].join("\n"),
      ),
  );

  server.registerResource(
    "safety_guide",
    "humanupgrade://prompts/safety",
    {
      title: "Evidence And Safety Guide",
      description:
        "Grounding and medical-safety instructions for agents using HumanUpgrade MCP.",
      mimeType: "text/markdown",
    },
    (uri) =>
      resourceText(
        uri.toString(),
        [
          "# Evidence And Safety Guide",
          "",
          "- Ground health and biotech responses in cited HumanUpgrade entities and external evidence when available.",
          "- Distinguish podcast discussion, claim text, product marketing, and peer-reviewed evidence.",
          "- Do not present evidence organization as medical advice.",
          "- Flag uncertainty, study limitations, conflicts of interest, and sponsor relationships.",
        ].join("\n"),
      ),
  );
}

function registerPrompts(server: McpServer) {
  server.registerPrompt(
    "verify_claim",
    {
      title: "Verify Claim",
      description:
        "Create a grounded plan for verifying a HumanUpgrade claim using internal claim/episode context and external evidence.",
      argsSchema: {
        claimId: z.string().optional().describe("Existing Claim id, if known."),
        claimText: z.string().optional().describe("Claim text when no Claim id exists yet."),
        focus: z.string().optional().describe("Optional verification focus, such as mechanism, safety, dosage, or evidence quality."),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              "Verify this HumanUpgrade claim.",
              args.claimId ? `Claim id: ${args.claimId}` : undefined,
              args.claimText ? `Claim text: ${args.claimText}` : undefined,
              args.focus ? `Focus: ${args.focus}` : undefined,
              "Use get_claim_context when a claim id is available. Search related episodes, products, and case studies. Return a cited verification plan with uncertainty and evidence gaps.",
            ].filter(Boolean).join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "episode_entity_extraction",
    {
      title: "Episode Entity Extraction",
      description:
        "Extract graph entity candidates and relationship proposals from a HumanUpgrade episode.",
      argsSchema: {
        episodeId: z.string().optional().describe("Episode id to inspect."),
        episodeSlug: z.string().optional().describe("Episode slug to inspect."),
        extractionFocus: z.string().optional().describe("Optional focus such as products, biomarkers, sponsors, compounds, claims, or case studies."),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              "Extract HumanUpgrade graph entity candidates from this episode.",
              args.episodeId ? `Episode id: ${args.episodeId}` : undefined,
              args.episodeSlug ? `Episode slug: ${args.episodeSlug}` : undefined,
              args.extractionFocus ? `Focus: ${args.extractionFocus}` : undefined,
              "Use get_episode_context first. Propose people, organizations, products, compounds, biomarkers, lab tests, case studies, and claims with evidence spans and confidence.",
            ].filter(Boolean).join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "product_evidence_brief",
    {
      title: "Product Evidence Brief",
      description:
        "Build an evidence-backed product brief from HumanUpgrade product, claim, episode, and case study context.",
      argsSchema: {
        productId: z.string().optional().describe("Product id, if known."),
        productSlug: z.string().optional().describe("Product slug, if known."),
        question: z.string().optional().describe("Specific user question for the product brief."),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              "Build a HumanUpgrade product evidence brief.",
              args.productId ? `Product id: ${args.productId}` : undefined,
              args.productSlug ? `Product slug: ${args.productSlug}` : undefined,
              args.question ? `Question: ${args.question}` : undefined,
              "Use get_product_context, then search related claims, episodes, and case studies. Separate product facts, podcast mentions, evidence, uncertainty, and next research steps.",
            ].filter(Boolean).join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "case_study_analysis",
    {
      title: "Case Study Analysis",
      description:
        "Analyze a case study as an evidence object for HumanUpgrade products, claims, or biotech research.",
      argsSchema: {
        caseStudyId: z.string().optional().describe("Case study id, if known."),
        caseStudySlug: z.string().optional().describe("Case study slug, if known."),
        focus: z.string().optional().describe("Optional focus such as design, outcomes, limitations, sponsors, or relevance."),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              "Analyze this HumanUpgrade case study.",
              args.caseStudyId ? `Case study id: ${args.caseStudyId}` : undefined,
              args.caseStudySlug ? `Case study slug: ${args.caseStudySlug}` : undefined,
              args.focus ? `Focus: ${args.focus}` : undefined,
              "Use get_case_study_context. Summarize design, intervention/exposure, outcomes, limitations, sponsor or organization links, and relevance to claims/products.",
            ].filter(Boolean).join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "research_task_plan",
    {
      title: "Research Task Plan",
      description:
        "Convert a biotech or product research objective into an actionable HumanUpgrade research plan.",
      argsSchema: {
        objective: z.string().describe("The research objective or user question."),
        startingEntityType: z.enum(supportedEntityTypes).optional().describe("Optional starting entity type."),
        startingEntityId: z.string().optional().describe("Optional starting entity id."),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              "Create a HumanUpgrade research task plan.",
              `Objective: ${args.objective}`,
              args.startingEntityType ? `Starting entity type: ${args.startingEntityType}` : undefined,
              args.startingEntityId ? `Starting entity id: ${args.startingEntityId}` : undefined,
              "Use search_schema to identify useful fields and inputs, then search_humanupgrade and context tools. Return search queries, target entities, evidence sources, schema fields to inspect, and recommended artifacts.",
            ].filter(Boolean).join("\n"),
          },
        },
      ],
    }),
  );
}

export function createHumanUpgradeMcpServer() {
  const server = new McpServer(
    {
      name: "humanupgrade-mcp",
      version: "0.1.0",
    },
    {
      instructions: SERVER_INSTRUCTIONS,
    },
  );

  registerTools(server);
  registerResources(server);
  registerPrompts(server);

  return server;
}
