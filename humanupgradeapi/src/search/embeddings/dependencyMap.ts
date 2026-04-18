import type { PrismaClient } from '../../../generated/client.js'
import type { EmbeddingSourceEntity } from './types.js'

type EmbeddingTarget = {
  entity: EmbeddingSourceEntity
  entityId: string
}

function dedupeTargets(targets: EmbeddingTarget[]): EmbeddingTarget[] {
  const seen = new Set<string>()

  return targets.filter(target => {
    const key = `${target.entity}:${target.entityId}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function getDependentEmbeddingTargets(args: {
  prisma: PrismaClient
  entity: EmbeddingSourceEntity
  entityId: string
}): Promise<EmbeddingTarget[]> {
  const { prisma, entity, entityId } = args

  switch (entity) {
    case 'compound': {
      const products = await prisma.product.findMany({
        where: {
          containsCompounds: {
            some: { id: entityId },
          },
        },
        select: { id: true },
      })

      return products.map(product => ({
        entity: 'product',
        entityId: product.id,
      }))
    }

    case 'labTest': {
      const products = await prisma.product.findMany({
        where: {
          labTests: {
            some: { id: entityId },
          },
        },
        select: { id: true },
      })

      return products.map(product => ({
        entity: 'product',
        entityId: product.id,
      }))
    }

    case 'biomarker': {
      const labTests = await prisma.labTest.findMany({
        where: {
          testsBiomarkers: {
            some: { id: entityId },
          },
        },
        select: { id: true },
      })

      return labTests.map(labTest => ({
        entity: 'labTest',
        entityId: labTest.id,
      }))
    }

    case 'organization': {
      const caseStudies = await prisma.caseStudy.findMany({
        where: {
          OR: [
            {
              businessSponsors: {
                some: { id: entityId },
              },
            },
            {
              referencedByOrganizations: {
                some: { id: entityId },
              },
            },
          ],
        },
        select: { id: true },
      })

      return dedupeTargets(
        caseStudies.map(caseStudy => ({
          entity: 'caseStudy',
          entityId: caseStudy.id,
        })),
      )
    }

    default:
      return []
  }
}
