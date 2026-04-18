import type { CaseStudy, Media, Organization } from '../../../generated/client.js'
import type { GraphQLContext } from '../../lib/context.js'

export const caseStudyResolvers = {
  CaseStudy: {
    businessSponsors: async (parent: CaseStudy, _: unknown, ctx: GraphQLContext): Promise<Organization[]> => {
      const orgs = await ctx.prisma.caseStudy.findUnique({ where: { id: parent.id } }).businessSponsors()
      return orgs ?? []
    },
    referencedByOrganizations: async (
      parent: CaseStudy,
      _: unknown,
      ctx: GraphQLContext,
    ): Promise<Organization[]> => {
      const orgs = await ctx.prisma.caseStudy
        .findUnique({ where: { id: parent.id } })
        .referencedByOrganizations()
      return orgs ?? []
    },
    media: async (parent: CaseStudy, _: unknown, ctx: GraphQLContext): Promise<Media[]> => {
      const media = await ctx.loaders.mediaByCaseStudyId.load(parent.id)
      return media
    },
  },
}
