import type { Biomarker, Compound, Media, Product } from '../../../generated/client.js'
import type { GraphQLContext } from '../../lib/context.js'

export const compoundResolvers = {
  Compound: {
    products: async (parent: Compound, _: unknown, ctx: GraphQLContext): Promise<Product[]> => {
      const products = await ctx.prisma.compound.findUnique({ where: { id: parent.id } }).products()
      return products ?? []
    },
    biomarkers: async (parent: Compound, _: unknown, ctx: GraphQLContext): Promise<Biomarker[]> => {
      const biomarkers = await ctx.prisma.compound.findUnique({ where: { id: parent.id } }).biomarkers()
      return biomarkers ?? []
    },
    media: async (parent: Compound, _: unknown, ctx: GraphQLContext): Promise<Media[]> => {
      const media = await ctx.loaders.mediaByCompoundId.load(parent.id)
      return media
    },
  },
}
