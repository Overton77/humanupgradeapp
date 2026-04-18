import DataLoader from 'dataloader'
import type { PrismaClient, Person } from '../../generated/client.js'

export function createPersonByIdLoader(prisma: PrismaClient) {
  return new DataLoader<string, Person | null>(async (ids) => {
    const persons = await prisma.person.findMany({
      where: { id: { in: [...ids] } },
    })
    const map = new Map(persons.map(p => [p.id, p]))
    return ids.map(id => map.get(id) ?? null)
  })
}
