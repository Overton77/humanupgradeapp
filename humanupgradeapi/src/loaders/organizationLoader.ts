import DataLoader from 'dataloader'
import type { PrismaClient, Organization } from '../../generated/client.js'

export function createOrganizationByIdLoader(prisma: PrismaClient) {
  return new DataLoader<string, Organization | null>(async (ids) => {
    const orgs = await prisma.organization.findMany({
      where: { id: { in: [...ids] } },
    })
    const map = new Map(orgs.map(o => [o.id, o]))
    return ids.map(id => map.get(id) ?? null)
  })
}
