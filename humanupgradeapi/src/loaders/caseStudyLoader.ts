import DataLoader from 'dataloader'
import type { PrismaClient, CaseStudy } from '../../generated/client.js'

export function createCaseStudyByIdLoader(prisma: PrismaClient) {
  return new DataLoader<string, CaseStudy | null>(async (ids) => {
    const studies = await prisma.caseStudy.findMany({
      where: { id: { in: [...ids] } },
    })
    const map = new Map(studies.map(s => [s.id, s]))
    return ids.map(id => map.get(id) ?? null)
  })
}
