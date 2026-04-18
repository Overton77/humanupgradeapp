import DataLoader from 'dataloader'
import type { PrismaClient, Claim } from '../../generated/client.js'

export function createClaimsByEpisodeIdLoader(prisma: PrismaClient) {
  return new DataLoader<string, Claim[]>(async (episodeIds) => {
    const claims = await prisma.claim.findMany({
      where: { episodeId: { in: [...episodeIds] } },
    })
    const map = new Map<string, Claim[]>()
    for (const c of claims) {
      const list = map.get(c.episodeId) ?? []
      list.push(c)
      map.set(c.episodeId, list)
    }
    return episodeIds.map(id => map.get(id) ?? [])
  })
}
