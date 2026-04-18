import DataLoader from 'dataloader'
import type { PrismaClient, Product } from '../../generated/client.js'

export function createProductByIdLoader(prisma: PrismaClient) {
  return new DataLoader<string, Product | null>(async (ids) => {
    const products = await prisma.product.findMany({
      where: { id: { in: [...ids] } },
    })
    const map = new Map(products.map(p => [p.id, p]))
    return ids.map(id => map.get(id) ?? null)
  })
}

export function createProductsByOrganizationIdLoader(prisma: PrismaClient) {
  return new DataLoader<string, Product[]>(async (orgIds) => {
    const products = await prisma.product.findMany({
      where: { organizationId: { in: [...orgIds] } },
    })
    const map = new Map<string, Product[]>()
    for (const p of products) {
      if (p.organizationId) {
        const list = map.get(p.organizationId) ?? []
        list.push(p)
        map.set(p.organizationId, list)
      }
    }
    return orgIds.map(id => map.get(id) ?? [])
  })
}
