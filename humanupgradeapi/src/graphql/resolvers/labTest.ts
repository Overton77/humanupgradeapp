import type { Biomarker, LabTest, Media, Organization, Product } from '../../../generated/client.js'
import type { GraphQLContext } from '../../lib/context.js'

export const labTestResolvers = {
  LabTest: {
    product: async (parent: LabTest, _: unknown, ctx: GraphQLContext): Promise<Product | null> => {
      if (!parent.productId) return null
      const product = await ctx.loaders.productById.load(parent.productId)
      return product
    },
    organization: async (parent: LabTest, _: unknown, ctx: GraphQLContext): Promise<Organization | null> => {
      if (!parent.organizationId) return null
      const organization = await ctx.loaders.organizationById.load(parent.organizationId)
      return organization
    },
    testsBiomarkers: async (parent: LabTest, _: unknown, ctx: GraphQLContext): Promise<Biomarker[]> => {
      const biomarkers = await ctx.prisma.labTest.findUnique({ where: { id: parent.id } }).testsBiomarkers()
      return biomarkers ?? []
    },
    media: async (parent: LabTest, _: unknown, ctx: GraphQLContext): Promise<Media[]> => {
      const media = await ctx.loaders.mediaByLabTestId.load(parent.id)
      return media
    },
  },
}
