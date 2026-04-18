import type { Claim, Episode, Media, Organization, Person, Podcast } from '../../../generated/client.js'
import type { GraphQLContext } from '../../lib/context.js'

export const episodeResolvers = {
  Episode: {
    podcast: async (parent: Episode, _: unknown, ctx: GraphQLContext): Promise<Podcast | null> => {
      const podcast = await ctx.prisma.podcast.findUnique({ where: { id: parent.podcastId } })
      return podcast
    },
    guests: async (parent: Episode, _: unknown, ctx: GraphQLContext): Promise<Person[]> => {
      const guests = await ctx.loaders.guestsByEpisodeId.load(parent.id)
      return guests
    },
    sponsorOrganizations: async (
      parent: Episode,
      _: unknown,
      ctx: GraphQLContext,
    ): Promise<Organization[]> => {
      const orgs = await ctx.loaders.sponsorsByEpisodeId.load(parent.id)
      return orgs
    },
    claims: async (parent: Episode, _: unknown, ctx: GraphQLContext): Promise<Claim[]> => {
      const claims = await ctx.loaders.claimsByEpisodeId.load(parent.id)
      return claims
    },
    media: async (parent: Episode, _: unknown, ctx: GraphQLContext): Promise<Media[]> => {
      const media = await ctx.loaders.mediaByEpisodeId.load(parent.id)
      return media
    },
  },
}
