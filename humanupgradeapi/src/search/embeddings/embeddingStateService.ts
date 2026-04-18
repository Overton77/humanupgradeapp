import type { PrismaClient } from '../../../generated/client.js'
import type { EmbeddingSourceEntity, EmbeddingStateStatus } from './types.js'

type UpsertEmbeddingStateArgs = {
  prisma: PrismaClient
  entity: EmbeddingSourceEntity
  entityId: string
  embeddingVersion: number
  contentHash: string
  embeddingStatus: EmbeddingStateStatus
  sourcePayloadJson?: unknown
  embeddingText?: string | null
  embeddingModel?: string | null
  embeddedAt?: Date | null
  lastError?: string | null
}

function buildEmbeddingStateWhere(entity: EmbeddingSourceEntity, entityId: string) {
  return {
    entityType_entityId: {
      entityType: entity,
      entityId,
    },
  }
}

export async function getEmbeddingState(
  prisma: PrismaClient,
  entity: EmbeddingSourceEntity,
  entityId: string,
) {
  return prisma.embeddingState.findUnique({
    where: buildEmbeddingStateWhere(entity, entityId),
  })
}

export async function upsertEmbeddingState(args: UpsertEmbeddingStateArgs) {
  const {
    prisma,
    entity,
    entityId,
    embeddingVersion,
    contentHash,
    embeddingStatus,
    sourcePayloadJson,
    embeddingText,
    embeddingModel,
    embeddedAt,
    lastError,
  } = args

  return prisma.embeddingState.upsert({
    where: buildEmbeddingStateWhere(entity, entityId),
    create: {
      entityType: entity,
      entityId,
      embeddingVersion,
      contentHash,
      embeddingStatus,
      sourcePayloadJson: sourcePayloadJson as any,
      embeddingText,
      embeddingModel,
      embeddedAt,
      lastError,
    },
    update: {
      embeddingVersion,
      contentHash,
      embeddingStatus,
      sourcePayloadJson: sourcePayloadJson as any,
      embeddingText,
      embeddingModel,
      embeddedAt,
      lastError,
    },
  })
}

export async function markEmbeddingError(args: {
  prisma: PrismaClient
  entity: EmbeddingSourceEntity
  entityId: string
  embeddingVersion: number
  contentHash: string
  sourcePayloadJson?: unknown
  embeddingText?: string | null
  embeddingModel?: string | null
  lastError: string
  embeddedAt?: Date | null
}) {
  return upsertEmbeddingState({
    prisma: args.prisma,
    entity: args.entity,
    entityId: args.entityId,
    embeddingVersion: args.embeddingVersion,
    contentHash: args.contentHash,
    embeddingStatus: 'ERROR',
    sourcePayloadJson: args.sourcePayloadJson,
    embeddingText: args.embeddingText,
    embeddingModel: args.embeddingModel,
    embeddedAt: args.embeddedAt,
    lastError: args.lastError,
  })
}
