import type {
  CaseStudy,
  Episode,
  LabTest,
  Media,
  Organization,
  Person,
  Product,
} from '../../../generated/client.js'
import type { GraphQLContext } from '../../lib/context.js'

export const organizationResolvers = {
  Organization: {
    products: async (parent: Organization, _: unknown, ctx: GraphQLContext): Promise<Product[]> => {
      const products = await ctx.loaders.productsByOrganizationId.load(parent.id)
      return products
    },
    owners: async (parent: Organization, _: unknown, ctx: GraphQLContext): Promise<Person[]> => {
      const owners = await ctx.prisma.organization.findUnique({ where: { id: parent.id } }).owners()
      return owners ?? []
    },
    executives: async (parent: Organization, _: unknown, ctx: GraphQLContext): Promise<Person[]> => {
      const executives = await ctx.prisma.organization.findUnique({ where: { id: parent.id } }).executives()
      return executives ?? []
    },
    labTests: async (parent: Organization, _: unknown, ctx: GraphQLContext): Promise<LabTest[]> => {
      const labTests = await ctx.loaders.labTestsByOrganizationId.load(parent.id)
      return labTests
    },
    sponsoredEpisodes: async (parent: Organization, _: unknown, ctx: GraphQLContext): Promise<Episode[]> => {
      const episodes = await ctx.prisma.organization
        .findUnique({ where: { id: parent.id } })
        .sponsoredEpisodes()
      return episodes ?? []
    },
    referencedCaseStudies: async (
      parent: Organization,
      _: unknown,
      ctx: GraphQLContext,
    ): Promise<CaseStudy[]> => {
      const caseStudies = await ctx.prisma.organization
        .findUnique({ where: { id: parent.id } })
        .referencedCaseStudies()
      return caseStudies ?? []
    },
    businessSponsoredCases: async (
      parent: Organization,
      _: unknown,
      ctx: GraphQLContext,
    ): Promise<CaseStudy[]> => {
      const caseStudies = await ctx.prisma.organization
        .findUnique({ where: { id: parent.id } })
        .businessSponsoredCases()
      return caseStudies ?? []
    },
    media: async (parent: Organization, _: unknown, ctx: GraphQLContext): Promise<Media[]> => {
      const media = await ctx.loaders.mediaByOrganizationId.load(parent.id)
      return media
    },
  },
}
