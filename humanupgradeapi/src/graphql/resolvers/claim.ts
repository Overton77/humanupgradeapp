import type { Claim, Episode, Media, Person } from '../../../generated/client.js'
import type { GraphQLContext } from '../../lib/context.js'

export const claimResolvers = {
  Claim: {
    episode: async (parent: Claim, _: unknown, ctx: GraphQLContext): Promise<Episode | null> => {
      const episode = await ctx.prisma.episode.findUnique({ where: { id: parent.episodeId } })
      return episode
    },
    speaker: async (parent: Claim, _: unknown, ctx: GraphQLContext): Promise<Person | null> => {
      if (!parent.speakerId) return null
      const speaker = await ctx.loaders.personById.load(parent.speakerId)
      return speaker
    },
    media: async (parent: Claim, _: unknown, ctx: GraphQLContext): Promise<Media[]> => {
      const media = await ctx.loaders.mediaByClaimId.load(parent.id)
      return media
    },
  },
}
