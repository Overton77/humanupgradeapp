import DataLoader from 'dataloader'
import type { PrismaClient, Person, Organization, Episode } from '../../generated/client.js'

export function createGuestsByEpisodeIdLoader(prisma: PrismaClient) {
  return new DataLoader<string, Person[]>(async (episodeIds) => {
    const episodes = await prisma.episode.findMany({
      where: { id: { in: [...episodeIds] } },
      include: { guests: true },
    })
    const map = new Map<string, Person[]>()
    for (const ep of episodes) {
      map.set(ep.id, (ep as any).guests ?? [])
    }
    return episodeIds.map(id => map.get(id) ?? [])
  })
}

export function createSponsorsByEpisodeIdLoader(prisma: PrismaClient) {
  return new DataLoader<string, Organization[]>(async (episodeIds) => {
    const episodes = await prisma.episode.findMany({
      where: { id: { in: [...episodeIds] } },
      include: { sponsorOrganizations: true },
    })
    const map = new Map<string, Organization[]>()
    for (const ep of episodes) {
      map.set(ep.id, (ep as any).sponsorOrganizations ?? [])
    }
    return episodeIds.map(id => map.get(id) ?? [])
  })
}

export function createEpisodesByPodcastIdLoader(prisma: PrismaClient) {
  return new DataLoader<string, Episode[]>(async (podcastIds) => {
    const episodes = await prisma.episode.findMany({
      where: { podcastId: { in: [...podcastIds] } },
    })
    const map = new Map<string, Episode[]>()
    for (const ep of episodes) {
      const list = map.get(ep.podcastId) ?? []
      list.push(ep)
      map.set(ep.podcastId, list)
    }
    return podcastIds.map(id => map.get(id) ?? [])
  })
}
