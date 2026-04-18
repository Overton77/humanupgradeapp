import type { EmbeddingSourceDataMap } from '../../validation/embeddingSource.js'
import { getEmbeddingRegistryEntry } from './embeddingRegistry.js'
import { hashEmbeddingSnapshot } from './embeddingHash.js'
import type { EmbeddingSourceEntity } from './types.js'

export type EmbeddingSnapshot<E extends EmbeddingSourceEntity = EmbeddingSourceEntity> = {
  entity: E
  version: number
  source: EmbeddingSourceDataMap[E]
  text: string
  contentHash: string
}

export function buildEmbeddingSnapshot<E extends EmbeddingSourceEntity>(
  entity: E,
  row: unknown,
): EmbeddingSnapshot<E> {
  const entry = getEmbeddingRegistryEntry(entity)
  const source = entry.sourceSchema.parse(entry.buildSource(row)) as EmbeddingSourceDataMap[E]
  const text = entry.buildText(source).trim()

  if (!text) {
    throw new Error(`Embedding text for ${entity} cannot be empty`)
  }

  return {
    entity,
    version: entry.version,
    source,
    text,
    contentHash: hashEmbeddingSnapshot({
      entity,
      version: entry.version,
      text,
    }),
  }
}
