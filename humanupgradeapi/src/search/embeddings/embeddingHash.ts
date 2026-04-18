import { createHash } from 'node:crypto'

export function hashEmbeddingSnapshot(input: {
  entity: string
  version: number
  text: string
}): string {
  return createHash('sha256')
    .update(JSON.stringify(input))
    .digest('hex')
}
