import type { PrismaClient } from '../../../generated/client.js'
import { getEmbeddingEntityTableName } from './entityMetadata.js'
import type { EmbeddingSourceEntity } from './types.js'

function serializeEmbeddingVector(vector: number[]): string {
  if (vector.length === 0) {
    throw new Error('Embedding vector cannot be empty')
  }

  for (const value of vector) {
    if (!Number.isFinite(value)) {
      throw new Error('Embedding vector contains a non-finite number')
    }
  }

  return `[${vector.join(',')}]`
}

export async function updateEmbeddingVectorForEntity(args: {
  prisma: PrismaClient
  entity: EmbeddingSourceEntity
  entityId: string
  vector: number[]
}): Promise<void> {
  const { prisma, entity, entityId, vector } = args
  const serializedVector = serializeEmbeddingVector(vector)
  const tableName = getEmbeddingEntityTableName(entity)

  let rowsUpdated = 0

  switch (tableName) {
    case 'Podcast':
      rowsUpdated = await prisma.$executeRaw`UPDATE "Podcast" SET "embedding" = CAST(${serializedVector} AS vector) WHERE "id" = ${entityId}`
      break
    case 'Episode':
      rowsUpdated = await prisma.$executeRaw`UPDATE "Episode" SET "embedding" = CAST(${serializedVector} AS vector) WHERE "id" = ${entityId}`
      break
    case 'Claim':
      rowsUpdated = await prisma.$executeRaw`UPDATE "Claim" SET "embedding" = CAST(${serializedVector} AS vector) WHERE "id" = ${entityId}`
      break
    case 'Person':
      rowsUpdated = await prisma.$executeRaw`UPDATE "Person" SET "embedding" = CAST(${serializedVector} AS vector) WHERE "id" = ${entityId}`
      break
    case 'Organization':
      rowsUpdated = await prisma.$executeRaw`UPDATE "Organization" SET "embedding" = CAST(${serializedVector} AS vector) WHERE "id" = ${entityId}`
      break
    case 'Product':
      rowsUpdated = await prisma.$executeRaw`UPDATE "Product" SET "embedding" = CAST(${serializedVector} AS vector) WHERE "id" = ${entityId}`
      break
    case 'Compound':
      rowsUpdated = await prisma.$executeRaw`UPDATE "Compound" SET "embedding" = CAST(${serializedVector} AS vector) WHERE "id" = ${entityId}`
      break
    case 'LabTest':
      rowsUpdated = await prisma.$executeRaw`UPDATE "LabTest" SET "embedding" = CAST(${serializedVector} AS vector) WHERE "id" = ${entityId}`
      break
    case 'Biomarker':
      rowsUpdated = await prisma.$executeRaw`UPDATE "Biomarker" SET "embedding" = CAST(${serializedVector} AS vector) WHERE "id" = ${entityId}`
      break
    case 'CaseStudy':
      rowsUpdated = await prisma.$executeRaw`UPDATE "CaseStudy" SET "embedding" = CAST(${serializedVector} AS vector) WHERE "id" = ${entityId}`
      break
    default:
      throw new Error(`Unsupported embedding entity table: ${tableName}`)
  }

  if (rowsUpdated !== 1) {
    throw new Error(`Expected to update one ${entity} embedding row, updated ${rowsUpdated}`)
  }
}
