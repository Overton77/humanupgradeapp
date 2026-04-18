import type { PrismaClient } from '../../../generated/client.js'
import type { EmbeddingSourceEntity } from './types.js'

const ENTITY_DELEGATE_NAMES: Record<EmbeddingSourceEntity, string> = {
  podcast: 'podcast',
  episode: 'episode',
  claim: 'claim',
  person: 'person',
  organization: 'organization',
  product: 'product',
  compound: 'compound',
  labTest: 'labTest',
  biomarker: 'biomarker',
  caseStudy: 'caseStudy',
}

const ENTITY_TABLE_NAMES: Record<EmbeddingSourceEntity, string> = {
  podcast: 'Podcast',
  episode: 'Episode',
  claim: 'Claim',
  person: 'Person',
  organization: 'Organization',
  product: 'Product',
  compound: 'Compound',
  labTest: 'LabTest',
  biomarker: 'Biomarker',
  caseStudy: 'CaseStudy',
}

export function getEmbeddingEntityDelegate(prisma: PrismaClient, entity: EmbeddingSourceEntity): any {
  return (prisma as any)[ENTITY_DELEGATE_NAMES[entity]]
}

export function getEmbeddingEntityTableName(entity: EmbeddingSourceEntity): string {
  return ENTITY_TABLE_NAMES[entity]
}
