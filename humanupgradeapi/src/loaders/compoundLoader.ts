import DataLoader from 'dataloader'
import type { PrismaClient, Compound } from '../../generated/client.js'

export function createCompoundByIdLoader(prisma: PrismaClient) {
  return new DataLoader<string, Compound | null>(async (ids) => {
    const compounds = await prisma.compound.findMany({
      where: { id: { in: [...ids] } },
    })
    const map = new Map(compounds.map(c => [c.id, c]))
    return ids.map(id => map.get(id) ?? null)
  })
}
