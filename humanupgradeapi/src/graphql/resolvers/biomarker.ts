import type { Biomarker, Compound, LabTest, Media } from '../../../generated/client.js'
import type { GraphQLContext } from '../../lib/context.js'

export const biomarkerResolvers = {
  Biomarker: {
    labTests: async (parent: Biomarker, _: unknown, ctx: GraphQLContext): Promise<LabTest[]> => {
      const labTests = await ctx.prisma.biomarker.findUnique({ where: { id: parent.id } }).labTests()
      return labTests ?? []
    },
    compounds: async (parent: Biomarker, _: unknown, ctx: GraphQLContext): Promise<Compound[]> => {
      const compounds = await ctx.prisma.biomarker.findUnique({ where: { id: parent.id } }).compounds()
      return compounds ?? []
    },
    media: async (parent: Biomarker, _: unknown, ctx: GraphQLContext): Promise<Media[]> => {
      const media = await ctx.loaders.mediaByBiomarkerId.load(parent.id)
      return media
    },
  },
}
