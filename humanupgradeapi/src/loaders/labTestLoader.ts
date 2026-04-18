import DataLoader from 'dataloader'
import type { PrismaClient, LabTest } from '../../generated/client.js'

export function createLabTestsByProductIdLoader(prisma: PrismaClient) {
  return new DataLoader<string, LabTest[]>(async (productIds) => {
    const tests = await prisma.labTest.findMany({
      where: { productId: { in: [...productIds] } },
    })
    const map = new Map<string, LabTest[]>()
    for (const t of tests) {
      if (t.productId) {
        const list = map.get(t.productId) ?? []
        list.push(t)
        map.set(t.productId, list)
      }
    }
    return productIds.map(id => map.get(id) ?? [])
  })
}

export function createLabTestsByOrganizationIdLoader(prisma: PrismaClient) {
  return new DataLoader<string, LabTest[]>(async (orgIds) => {
    const tests = await prisma.labTest.findMany({
      where: { organizationId: { in: [...orgIds] } },
    })
    const map = new Map<string, LabTest[]>()
    for (const t of tests) {
      if (t.organizationId) {
        const list = map.get(t.organizationId) ?? []
        list.push(t)
        map.set(t.organizationId, list)
      }
    }
    return orgIds.map(id => map.get(id) ?? [])
  })
}
