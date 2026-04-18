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
  createBiomarker,
  createCaseStudy,
  createClaim,
  createCompound,
  createEpisode,
  createLabTest,
  createOrganization,
  createPerson,
  createPodcast,
  createProduct,
  updateBiomarker,
  updateCaseStudy,
  updateClaim,
  updateCompound,
  updateEpisode,
  updateLabTest,
  updateOrganization,
  updatePerson,
  updatePodcast,
  updateProduct,
} from "../../services/searchableEntityWriteService.js";
import { resolveEpisodeWhereUnique, resolveWhere, applyNullableOp } from "./helpers.js";
import type {
  CreateBiomarkerMutationArgs,
  CreateCaseStudyMutationArgs,
  CreateClaimMutationArgs,
  CreateCompoundMutationArgs,
  CreateEpisodeMutationArgs,
  CreateLabTestMutationArgs,
  CreateMediaMutationArgs,
  CreateOrganizationMutationArgs,
  CreatePersonMutationArgs,
  CreatePodcastMutationArgs,
  CreateProductMutationArgs,
  DeleteBiomarkerMutationArgs,
  DeleteCaseStudyMutationArgs,
  DeleteClaimMutationArgs,
  DeleteCompoundMutationArgs,
  DeleteEpisodeMutationArgs,
  DeleteLabTestMutationArgs,
  DeleteMediaMutationArgs,
  DeleteOrganizationMutationArgs,
  DeletePersonMutationArgs,
  DeletePodcastMutationArgs,
  DeleteProductMutationArgs,
  UpdateBiomarkerMutationArgs,
  UpdateCaseStudyMutationArgs,
  UpdateClaimMutationArgs,
  UpdateCompoundMutationArgs,
  UpdateEpisodeMutationArgs,
  UpdateLabTestMutationArgs,
  UpdateMediaMutationArgs,
  UpdateOrganizationMutationArgs,
  UpdatePersonMutationArgs,
  UpdatePodcastMutationArgs,
  UpdateProductMutationArgs,
} from "./mutationArgs.js";

function pickDefined(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) result[k] = v;
  }
  return result;
}

/** Root `Mutation` field parent is always `null` in GraphQL execution. */
type MutationRoot = null;

export const mutationResolvers = {
  Mutation: {
    // ─── Podcast ───────────────────────────────────────────────────────
    createPodcast: async (
      _parent: MutationRoot,
      { data, embedding }: CreatePodcastMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Podcast> => {
      const podcast = await createPodcast({ ctx, data, embedding });
      return podcast;
    },

    updatePodcast: async (
      _parent: MutationRoot,
      { where, data, embedding }: UpdatePodcastMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Podcast> => {
      const podcast = await updatePodcast({ ctx, where, data, embedding });
      return podcast;
    },

    deletePodcast: async (
      _parent: MutationRoot,
      { where }: DeletePodcastMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Podcast> => {
      const existing = await ctx.prisma.podcast.findUniqueOrThrow({
        where: resolveWhere(where),
      });
      const deleted = await ctx.prisma.podcast.delete({
        where: { id: existing.id },
      });
      return deleted;
    },

    // ─── Episode ──────────────────────────────────────────────────────
    createEpisode: async (
      _parent: MutationRoot,
      { data, embedding }: CreateEpisodeMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Episode> => {
      const episode = await createEpisode({ ctx, data, embedding });
      return episode;
    },

    updateEpisode: async (
      _parent: MutationRoot,
      { where, data, embedding }: UpdateEpisodeMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Episode> => {
      const episode = await updateEpisode({ ctx, where, data, embedding });
      return episode;
    },

    deleteEpisode: async (
      _parent: MutationRoot,
      { where }: DeleteEpisodeMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Episode> => {
      const existing = await ctx.prisma.episode.findUniqueOrThrow({
        where: resolveEpisodeWhereUnique(where),
      });
      const deleted = await ctx.prisma.episode.delete({
        where: { id: existing.id },
      });
      return deleted;
    },

    // ─── Claim ────────────────────────────────────────────────────────
    createClaim: async (
      _parent: MutationRoot,
      { data, embedding }: CreateClaimMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Claim> => {
      const claim = await createClaim({ ctx, data, embedding });
      return claim;
    },

    updateClaim: async (
      _parent: MutationRoot,
      { where, data, embedding }: UpdateClaimMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Claim> => {
      const claim = await updateClaim({ ctx, where, data, embedding });
      return claim;
    },

    deleteClaim: async (
      _parent: MutationRoot,
      { where }: DeleteClaimMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Claim> => {
      const existing = await ctx.prisma.claim.findUniqueOrThrow({
        where: resolveWhere(where, ["id"]),
      });
      const deleted = await ctx.prisma.claim.delete({
        where: { id: existing.id },
      });
      return deleted;
    },

    // ─── Person ───────────────────────────────────────────────────────
    createPerson: async (
      _parent: MutationRoot,
      { data, embedding }: CreatePersonMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Person> => {
      const person = await createPerson({ ctx, data, embedding });
      return person;
    },

    updatePerson: async (
      _parent: MutationRoot,
      { where, data, embedding }: UpdatePersonMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Person> => {
      const person = await updatePerson({ ctx, where, data, embedding });
      return person;
    },

    deletePerson: async (
      _parent: MutationRoot,
      { where }: DeletePersonMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Person> => {
      const existing = await ctx.prisma.person.findUniqueOrThrow({
        where: resolveWhere(where),
      });
      const deleted = await ctx.prisma.person.delete({
        where: { id: existing.id },
      });
      return deleted;
    },

    // ─── Organization ─────────────────────────────────────────────────
    createOrganization: async (
      _parent: MutationRoot,
      { data, embedding }: CreateOrganizationMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Organization> => {
      const organization = await createOrganization({ ctx, data, embedding });
      return organization;
    },

    updateOrganization: async (
      _parent: MutationRoot,
      { where, data, embedding }: UpdateOrganizationMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Organization> => {
      const organization = await updateOrganization({
        ctx,
        where,
        data,
        embedding,
      });
      return organization;
    },

    deleteOrganization: async (
      _parent: MutationRoot,
      { where }: DeleteOrganizationMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Organization> => {
      const existing = await ctx.prisma.organization.findUniqueOrThrow({
        where: resolveWhere(where),
      });
      const deleted = await ctx.prisma.organization.delete({
        where: { id: existing.id },
      });
      return deleted;
    },

    // ─── Product ──────────────────────────────────────────────────────
    createProduct: async (
      _parent: MutationRoot,
      { data, embedding }: CreateProductMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Product> => {
      const product = await createProduct({ ctx, data, embedding });
      return product;
    },

    updateProduct: async (
      _parent: MutationRoot,
      { where, data, embedding }: UpdateProductMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Product> => {
      const product = await updateProduct({ ctx, where, data, embedding });
      return product;
    },

    deleteProduct: async (
      _parent: MutationRoot,
      { where }: DeleteProductMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Product> => {
      const existing = await ctx.prisma.product.findUniqueOrThrow({
        where: resolveWhere(where),
      });
      const deleted = await ctx.prisma.product.delete({
        where: { id: existing.id },
      });
      return deleted;
    },

    // ─── Compound ─────────────────────────────────────────────────────
    createCompound: async (
      _parent: MutationRoot,
      { data, embedding }: CreateCompoundMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Compound> => {
      const compound = await createCompound({ ctx, data, embedding });
      return compound;
    },

    updateCompound: async (
      _parent: MutationRoot,
      { where, data, embedding }: UpdateCompoundMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Compound> => {
      const compound = await updateCompound({ ctx, where, data, embedding });
      return compound;
    },

    deleteCompound: async (
      _parent: MutationRoot,
      { where }: DeleteCompoundMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Compound> => {
      const existing = await ctx.prisma.compound.findUniqueOrThrow({
        where: resolveWhere(where),
      });
      const deleted = await ctx.prisma.compound.delete({
        where: { id: existing.id },
      });
      return deleted;
    },

    // ─── LabTest ──────────────────────────────────────────────────────
    createLabTest: async (
      _parent: MutationRoot,
      { data, embedding }: CreateLabTestMutationArgs,
      ctx: GraphQLContext,
    ): Promise<LabTest> => {
      const labTest = await createLabTest({ ctx, data, embedding });
      return labTest;
    },

    updateLabTest: async (
      _parent: MutationRoot,
      { where, data, embedding }: UpdateLabTestMutationArgs,
      ctx: GraphQLContext,
    ): Promise<LabTest> => {
      const labTest = await updateLabTest({ ctx, where, data, embedding });
      return labTest;
    },

    deleteLabTest: async (
      _parent: MutationRoot,
      { where }: DeleteLabTestMutationArgs,
      ctx: GraphQLContext,
    ): Promise<LabTest> => {
      const existing = await ctx.prisma.labTest.findUniqueOrThrow({
        where: resolveWhere(where),
      });
      const deleted = await ctx.prisma.labTest.delete({
        where: { id: existing.id },
      });
      return deleted;
    },

    // ─── Biomarker ────────────────────────────────────────────────────
    createBiomarker: async (
      _parent: MutationRoot,
      { data, embedding }: CreateBiomarkerMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Biomarker> => {
      const biomarker = await createBiomarker({ ctx, data, embedding });
      return biomarker;
    },

    updateBiomarker: async (
      _parent: MutationRoot,
      { where, data, embedding }: UpdateBiomarkerMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Biomarker> => {
      const biomarker = await updateBiomarker({ ctx, where, data, embedding });
      return biomarker;
    },

    deleteBiomarker: async (
      _parent: MutationRoot,
      { where }: DeleteBiomarkerMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Biomarker> => {
      const existing = await ctx.prisma.biomarker.findUniqueOrThrow({
        where: resolveWhere(where),
      });
      const deleted = await ctx.prisma.biomarker.delete({
        where: { id: existing.id },
      });
      return deleted;
    },

    // ─── CaseStudy ────────────────────────────────────────────────────
    createCaseStudy: async (
      _parent: MutationRoot,
      { data, embedding }: CreateCaseStudyMutationArgs,
      ctx: GraphQLContext,
    ): Promise<CaseStudy> => {
      const caseStudy = await createCaseStudy({ ctx, data, embedding });
      return caseStudy;
    },

    updateCaseStudy: async (
      _parent: MutationRoot,
      { where, data, embedding }: UpdateCaseStudyMutationArgs,
      ctx: GraphQLContext,
    ): Promise<CaseStudy> => {
      const caseStudy = await updateCaseStudy({ ctx, where, data, embedding });
      return caseStudy;
    },

    deleteCaseStudy: async (
      _parent: MutationRoot,
      { where }: DeleteCaseStudyMutationArgs,
      ctx: GraphQLContext,
    ): Promise<CaseStudy> => {
      const existing = await ctx.prisma.caseStudy.findUniqueOrThrow({
        where: resolveWhere(where),
      });
      const deleted = await ctx.prisma.caseStudy.delete({
        where: { id: existing.id },
      });
      return deleted;
    },

    // ─── Media ────────────────────────────────────────────────────────
    createMedia: async (
      _parent: MutationRoot,
      { data }: CreateMediaMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Media> => {
      const media = await ctx.prisma.media.create({ data });
      return media;
    },

    updateMedia: async (
      _parent: MutationRoot,
      { where, data }: UpdateMediaMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Media> => {
      const media = await ctx.prisma.media.update({
        where: resolveWhere(where, ["id"]),
        data: pickDefined({
          url: data.url,
          type: data.type,
          mimeType: applyNullableOp(data.mimeType),
          title: applyNullableOp(data.title),
          altText: applyNullableOp(data.altText),
          caption: applyNullableOp(data.caption),
          width: applyNullableOp(data.width),
          height: applyNullableOp(data.height),
          durationSeconds: applyNullableOp(data.durationSeconds),
          fileSizeBytes: applyNullableOp(data.fileSizeBytes),
          sortOrder: data.sortOrder,
        }),
      });
      return media;
    },

    deleteMedia: async (
      _parent: MutationRoot,
      { where }: DeleteMediaMutationArgs,
      ctx: GraphQLContext,
    ): Promise<Media> => {
      const media = await ctx.prisma.media.delete({
        where: resolveWhere(where, ["id"]),
      });
      return media;
    },
  },
};
