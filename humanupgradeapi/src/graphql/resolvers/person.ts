import type { Claim, Episode, Media, Organization, Person } from '../../../generated/client.js'
import type { GraphQLContext } from '../../lib/context.js'

export const personResolvers = {
  Person: {
    guestEpisodes: async (parent: Person, _: unknown, ctx: GraphQLContext): Promise<Episode[]> => {
      const episodes = await ctx.prisma.person.findUnique({ where: { id: parent.id } }).guestEpisodes()
      return episodes ?? []
    },
    spokenClaims: async (parent: Person, _: unknown, ctx: GraphQLContext): Promise<Claim[]> => {
      const claims = await ctx.prisma.person.findUnique({ where: { id: parent.id } }).spokenClaims()
      return claims ?? []
    },
    ownedOrganizations: async (parent: Person, _: unknown, ctx: GraphQLContext): Promise<Organization[]> => {
      const orgs = await ctx.prisma.person.findUnique({ where: { id: parent.id } }).ownedOrganizations()
      return orgs ?? []
    },
    executiveOrganizations: async (parent: Person, _: unknown, ctx: GraphQLContext): Promise<Organization[]> => {
      const orgs = await ctx.prisma.person.findUnique({ where: { id: parent.id } }).executiveOrganizations()
      return orgs ?? []
    },
    media: async (parent: Person, _: unknown, ctx: GraphQLContext): Promise<Media[]> => {
      const media = await ctx.loaders.mediaByPersonId.load(parent.id)
      return media
    },
  },
}
