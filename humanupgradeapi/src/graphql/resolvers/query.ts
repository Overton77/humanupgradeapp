import type {
  Biomarker,
  CaseStudy,
  Claim,
  Compound,
  Episode,
  LabTest,
  Media,
  Organization,
  Person,
  Podcast,
  Product,
} from "../../../generated/client.js";
import type { GraphQLContext } from "../../lib/context.js";
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
  type BiomarkerSearchInput,
  type CaseStudySearchInput,
  type ClaimSearchInput,
  type CompoundSearchInput,
  type EpisodeSearchInput,
  type LabTestSearchInput,
  type OrganizationSearchInput,
  type PersonSearchInput,
  type PodcastSearchInput,
  type ProductSearchInput,
} from "../../search/entitySearchService.js";
import { resolveEpisodeWhereUnique, resolveWhere } from "./helpers.js";

/** Root `Query` field parent is always `null` in GraphQL execution. */
type QueryRoot = null;

export const queryResolvers = {
  Query: {
    podcast: async (
      _parent: QueryRoot,
      args: { id?: string; slug?: string },
      ctx: GraphQLContext,
    ): Promise<Podcast | null> => {
      const podcast = await ctx.prisma.podcast.findUnique({
        where: resolveWhere(args),
      });
      return podcast;
    },

    podcasts: async (
      _parent: QueryRoot,
      args: { input?: PodcastSearchInput | null },
      ctx: GraphQLContext,
    ) => searchPodcasts(ctx.prisma, args.input),

    episode: async (
      _parent: QueryRoot,
      args: { id?: string; slug?: string; episodePageUrl?: string },
      ctx: GraphQLContext,
    ): Promise<Episode | null> => {
      const episode = await ctx.prisma.episode.findUnique({
        where: resolveEpisodeWhereUnique(args),
      });
      return episode;
    },

    episodes: async (
      _parent: QueryRoot,
      args: { input?: EpisodeSearchInput | null },
      ctx: GraphQLContext,
    ) => searchEpisodes(ctx.prisma, args.input),

    claim: async (
      _parent: QueryRoot,
      args: { id?: string },
      ctx: GraphQLContext,
    ): Promise<Claim | null> => {
      if (!args.id) return null;
      const claim = await ctx.prisma.claim.findUnique({
        where: { id: args.id },
      });
      return claim;
    },

    claims: async (
      _parent: QueryRoot,
      args: { input?: ClaimSearchInput | null },
      ctx: GraphQLContext,
    ) => searchClaims(ctx.prisma, args.input),

    person: async (
      _parent: QueryRoot,
      args: { id?: string; slug?: string },
      ctx: GraphQLContext,
    ): Promise<Person | null> => {
      const person = await ctx.prisma.person.findUnique({
        where: resolveWhere(args),
      });
      return person;
    },

    persons: async (
      _parent: QueryRoot,
      args: { input?: PersonSearchInput | null },
      ctx: GraphQLContext,
    ) => searchPersons(ctx.prisma, args.input),

    organization: async (
      _parent: QueryRoot,
      args: { id?: string; slug?: string },
      ctx: GraphQLContext,
    ): Promise<Organization | null> => {
      const organization = await ctx.prisma.organization.findUnique({
        where: resolveWhere(args),
      });
      return organization;
    },

    organizations: async (
      _parent: QueryRoot,
      args: { input?: OrganizationSearchInput | null },
      ctx: GraphQLContext,
    ) => searchOrganizations(ctx.prisma, args.input),

    product: async (
      _parent: QueryRoot,
      args: { id?: string; slug?: string },
      ctx: GraphQLContext,
    ): Promise<Product | null> => {
      const product = await ctx.prisma.product.findUnique({
        where: resolveWhere(args),
      });
      return product;
    },

    products: async (
      _parent: QueryRoot,
      args: { input?: ProductSearchInput | null },
      ctx: GraphQLContext,
    ) => searchProducts(ctx.prisma, args.input),

    compound: async (
      _parent: QueryRoot,
      args: { id?: string; slug?: string },
      ctx: GraphQLContext,
    ): Promise<Compound | null> => {
      const compound = await ctx.prisma.compound.findUnique({
        where: resolveWhere(args),
      });
      return compound;
    },

    compounds: async (
      _parent: QueryRoot,
      args: { input?: CompoundSearchInput | null },
      ctx: GraphQLContext,
    ) => searchCompounds(ctx.prisma, args.input),

    labTest: async (
      _parent: QueryRoot,
      args: { id?: string; slug?: string },
      ctx: GraphQLContext,
    ): Promise<LabTest | null> => {
      const labTest = await ctx.prisma.labTest.findUnique({
        where: resolveWhere(args),
      });
      return labTest;
    },

    labTests: async (
      _parent: QueryRoot,
      args: { input?: LabTestSearchInput | null },
      ctx: GraphQLContext,
    ) => searchLabTests(ctx.prisma, args.input),

    biomarker: async (
      _parent: QueryRoot,
      args: { id?: string; slug?: string },
      ctx: GraphQLContext,
    ): Promise<Biomarker | null> => {
      const biomarker = await ctx.prisma.biomarker.findUnique({
        where: resolveWhere(args),
      });
      return biomarker;
    },

    biomarkers: async (
      _parent: QueryRoot,
      args: { input?: BiomarkerSearchInput | null },
      ctx: GraphQLContext,
    ) => searchBiomarkers(ctx.prisma, args.input),

    caseStudy: async (
      _parent: QueryRoot,
      args: { id?: string; slug?: string },
      ctx: GraphQLContext,
    ): Promise<CaseStudy | null> => {
      const caseStudy = await ctx.prisma.caseStudy.findUnique({
        where: resolveWhere(args),
      });
      return caseStudy;
    },

    caseStudies: async (
      _parent: QueryRoot,
      args: { input?: CaseStudySearchInput | null },
      ctx: GraphQLContext,
    ) => searchCaseStudies(ctx.prisma, args.input),

    media: async (
      _parent: QueryRoot,
      args: { id?: string },
      ctx: GraphQLContext,
    ): Promise<Media | null> => {
      if (!args.id) return null;
      const media = await ctx.prisma.media.findUnique({
        where: { id: args.id },
      });
      return media;
    },
  },
};
