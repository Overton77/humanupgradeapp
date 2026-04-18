import DataLoader from 'dataloader'
import type { PrismaClient, Biomarker } from '../../generated/client.js'

export function createBiomarkerByIdLoader(prisma: PrismaClient) {
  return new DataLoader<string, Biomarker | null>(async (ids) => {
    const biomarkers = await prisma.biomarker.findMany({
      where: { id: { in: [...ids] } },
    })
    const map = new Map(biomarkers.map(b => [b.id, b]))
    return ids.map(id => map.get(id) ?? null)
  })
}
