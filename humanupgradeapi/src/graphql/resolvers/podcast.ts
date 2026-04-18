import type { Episode, Media, Podcast } from '../../../generated/client.js'
import type { GraphQLContext } from '../../lib/context.js'

export const podcastResolvers = {
  Podcast: {
    episodes: async (parent: Podcast, _: unknown, ctx: GraphQLContext): Promise<Episode[]> => {
      const episodes = await ctx.loaders.episodesByPodcastId.load(parent.id)
      return episodes
    },
    media: async (parent: Podcast, _: unknown, ctx: GraphQLContext): Promise<Media[]> => {
      const media = await ctx.loaders.mediaByPodcastId.load(parent.id)
      return media
    },
  },
}
