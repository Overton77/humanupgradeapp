import type { Compound, LabTest, Media, Organization, Product } from '../../../generated/client.js'
import type { GraphQLContext } from '../../lib/context.js'

export const productResolvers = {
  Product: {
    organization: async (parent: Product, _: unknown, ctx: GraphQLContext): Promise<Organization | null> => {
      if (!parent.organizationId) return null
      const organization = await ctx.loaders.organizationById.load(parent.organizationId)
      return organization
    },
    containsCompounds: async (parent: Product, _: unknown, ctx: GraphQLContext): Promise<Compound[]> => {
      const compounds = await ctx.prisma.product.findUnique({ where: { id: parent.id } }).containsCompounds()
      return compounds ?? []
    },
    labTests: async (parent: Product, _: unknown, ctx: GraphQLContext): Promise<LabTest[]> => {
      const labTests = await ctx.loaders.labTestsByProductId.load(parent.id)
      return labTests
    },
    media: async (parent: Product, _: unknown, ctx: GraphQLContext): Promise<Media[]> => {
      const media = await ctx.loaders.mediaByProductId.load(parent.id)
      return media
    },
  },
}
