import { z } from 'zod'

export const EmbeddingWriteModeSchema = z.enum(['AUTO', 'SKIP', 'FORCE'])
export type EmbeddingWriteMode = z.infer<typeof EmbeddingWriteModeSchema>

export const EmbeddingWriteOptionsInputSchema = z.object({
  mode: EmbeddingWriteModeSchema.default('AUTO'),
})
export type EmbeddingWriteOptionsInput = z.infer<typeof EmbeddingWriteOptionsInputSchema>
