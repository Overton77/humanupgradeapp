import type { EmbeddingSourceEntity } from '../../validation/embeddingSource.js'

export type { EmbeddingSourceEntity } from '../../validation/embeddingSource.js'

export const EMBEDDING_WRITE_MODES = ['AUTO', 'SKIP', 'FORCE'] as const
export type EmbeddingWriteMode = (typeof EMBEDDING_WRITE_MODES)[number]

export const EMBEDDING_STATE_STATUSES = ['MISSING', 'READY', 'STALE', 'ERROR'] as const
export type EmbeddingStateStatus = (typeof EMBEDDING_STATE_STATUSES)[number]

export type EmbeddingWriteOptions = {
  mode?: EmbeddingWriteMode | null
}

export type EmbeddingSelector = {
  id?: string | null
  slug?: string | null
}

export type NestedEmbeddingSyncCandidate = {
  entity: EmbeddingSourceEntity
  selector: EmbeddingSelector
  mode: EmbeddingWriteMode
}

export function resolveEmbeddingWriteMode(
  options?: EmbeddingWriteOptions | null,
): EmbeddingWriteMode {
  return options?.mode ?? 'AUTO'
}
