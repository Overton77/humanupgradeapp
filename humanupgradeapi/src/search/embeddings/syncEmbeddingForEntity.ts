import type { PrismaClient } from '../../../generated/client.js'
import {
  embedTextBedrock,
  resolveEmbeddingModelId,
} from './bedrockEmbeddingClient.js'
import { getEmbeddingEntityDelegate } from './entityMetadata.js'
import { getEmbeddingRegistryEntry } from './embeddingRegistry.js'
import { buildEmbeddingSnapshot } from './embeddingSnapshot.js'
import {
  getEmbeddingState,
  markEmbeddingError,
  upsertEmbeddingState,
} from './embeddingStateService.js'
import { updateEmbeddingVectorForEntity } from './embeddingVectorStore.js'
import type { EmbeddingSourceEntity, EmbeddingWriteMode } from './types.js'

function shouldGenerateEmbedding(args: {
  mode: EmbeddingWriteMode
  previousVersion?: number
  previousHash?: string
  previousStatus?: string
  nextVersion: number
  nextHash: string
}): boolean {
  const {
    mode,
    previousVersion,
    previousHash,
    previousStatus,
    nextVersion,
    nextHash,
  } = args

  if (mode === 'FORCE') return true
  if (mode === 'SKIP') return false

  return (
    previousStatus !== 'READY' ||
    previousVersion !== nextVersion ||
    previousHash !== nextHash
  )
}

export async function syncEmbeddingForEntity(args: {
  prisma: PrismaClient
  entity: EmbeddingSourceEntity
  entityId: string
  mode: EmbeddingWriteMode
}): Promise<void> {
  const { prisma, entity, entityId, mode } = args
  const entry = getEmbeddingRegistryEntry(entity)
  const delegate = getEmbeddingEntityDelegate(prisma, entity)
  const row = await delegate.findUniqueOrThrow({
    where: { id: entityId },
    select: entry.select,
  })

  const snapshot = buildEmbeddingSnapshot(entity, row)
  const previousState = await getEmbeddingState(prisma, entity, entityId)
  const generateEmbedding = shouldGenerateEmbedding({
    mode,
    previousVersion: previousState?.embeddingVersion,
    previousHash: previousState?.contentHash,
    previousStatus: previousState?.embeddingStatus,
    nextVersion: snapshot.version,
    nextHash: snapshot.contentHash,
  })

  if (!generateEmbedding) {
    const skippedStatus = mode === 'SKIP'
      ? (previousState?.embeddingStatus === 'READY' ? 'STALE' : 'MISSING')
      : 'READY'
    await upsertEmbeddingState({
      prisma,
      entity,
      entityId,
      embeddingVersion: snapshot.version,
      contentHash: snapshot.contentHash,
      embeddingStatus: skippedStatus,
      sourcePayloadJson: snapshot.source,
      embeddingText: snapshot.text,
      embeddingModel: previousState?.embeddingModel ?? null,
      embeddedAt: previousState?.embeddedAt ?? null,
      lastError: null,
    })
    return
  }

  const resolvedModelId = resolveEmbeddingModelId()

  try {
    const vector = await embedTextBedrock(snapshot.text)
    await updateEmbeddingVectorForEntity({
      prisma,
      entity,
      entityId,
      vector,
    })

    await upsertEmbeddingState({
      prisma,
      entity,
      entityId,
      embeddingVersion: snapshot.version,
      contentHash: snapshot.contentHash,
      embeddingStatus: 'READY',
      sourcePayloadJson: snapshot.source,
      embeddingText: snapshot.text,
      embeddingModel: resolvedModelId,
      embeddedAt: new Date(),
      lastError: null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await markEmbeddingError({
      prisma,
      entity,
      entityId,
      embeddingVersion: snapshot.version,
      contentHash: snapshot.contentHash,
      sourcePayloadJson: snapshot.source,
      embeddingText: snapshot.text,
      embeddingModel: previousState?.embeddingModel ?? resolvedModelId,
      embeddedAt: previousState?.embeddedAt ?? null,
      lastError: message,
    })
    throw error
  }
}
