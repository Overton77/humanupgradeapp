import DataLoader from 'dataloader'
import type { PrismaClient, Media } from '../../generated/client.js'

type MediaOwnerKey =
  | { podcastId: string }
  | { episodeId: string }
  | { claimId: string }
  | { personId: string }
  | { organizationId: string }
  | { productId: string }
  | { compoundId: string }
  | { labTestId: string }
  | { biomarkerId: string }
  | { caseStudyId: string }

function createMediaByFkLoader(prisma: PrismaClient, fkField: keyof Media) {
  return new DataLoader<string, Media[]>(async (parentIds) => {
    const media = await prisma.media.findMany({
      where: { [fkField]: { in: [...parentIds] } },
      orderBy: { sortOrder: 'asc' },
    })
    const map = new Map<string, Media[]>()
    for (const m of media) {
      const key = (m as any)[fkField] as string | null
      if (key) {
        const list = map.get(key) ?? []
        list.push(m)
        map.set(key, list)
      }
    }
    return parentIds.map(id => map.get(id) ?? [])
  })
}

export function createMediaByPodcastIdLoader(prisma: PrismaClient) {
  return createMediaByFkLoader(prisma, 'podcastId')
}

export function createMediaByEpisodeIdLoader(prisma: PrismaClient) {
  return createMediaByFkLoader(prisma, 'episodeId')
}

export function createMediaByClaimIdLoader(prisma: PrismaClient) {
  return createMediaByFkLoader(prisma, 'claimId')
}

export function createMediaByPersonIdLoader(prisma: PrismaClient) {
  return createMediaByFkLoader(prisma, 'personId')
}

export function createMediaByOrganizationIdLoader(prisma: PrismaClient) {
  return createMediaByFkLoader(prisma, 'organizationId')
}

export function createMediaByProductIdLoader(prisma: PrismaClient) {
  return createMediaByFkLoader(prisma, 'productId')
}

export function createMediaByCompoundIdLoader(prisma: PrismaClient) {
  return createMediaByFkLoader(prisma, 'compoundId')
}

export function createMediaByLabTestIdLoader(prisma: PrismaClient) {
  return createMediaByFkLoader(prisma, 'labTestId')
}

export function createMediaByBiomarkerIdLoader(prisma: PrismaClient) {
  return createMediaByFkLoader(prisma, 'biomarkerId')
}

export function createMediaByCaseStudyIdLoader(prisma: PrismaClient) {
  return createMediaByFkLoader(prisma, 'caseStudyId')
}
