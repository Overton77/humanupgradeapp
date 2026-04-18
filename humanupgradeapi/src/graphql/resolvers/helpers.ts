import type { GraphQLContext } from '../../lib/context.js'
import { getEmbeddingEntityDelegate } from '../../search/embeddings/entityMetadata.js'
import type {
  EmbeddingSourceEntity,
  EmbeddingWriteMode,
  NestedEmbeddingSyncCandidate,
} from '../../search/embeddings/types.js'

/**
 * Converts a nullable operation input { set, clear } into a Prisma-compatible value.
 * Returns undefined if the operation should be skipped (not provided).
 */
export function applyNullableOp<T>(
  op: { set?: T; clear?: boolean } | undefined
): T | null | undefined {
  if (op === undefined) return undefined
  if (op.clear) return null
  if (op.set !== undefined) return op.set
  return undefined
}

/**
 * Applies a string list operation (set/add/remove) to an existing array.
 * Returns the new array value for Prisma { set: [...] }, or undefined to skip.
 */
export function applyStringListOp(
  current: string[],
  op: { set?: string[]; add?: string[]; remove?: string[] } | undefined
): string[] | undefined {
  if (op === undefined) return undefined
  if (op.set) return [...new Set(op.set)]
  let result = [...current]
  if (op.add) {
    const addSet = new Set(op.add)
    for (const item of addSet) {
      if (!result.includes(item)) result.push(item)
    }
  }
  if (op.remove) {
    const removeSet = new Set(op.remove)
    result = result.filter(item => !removeSet.has(item))
  }
  return result
}

/**
 * Resolves a unique selector object to a Prisma where clause.
 */
export function resolveWhere(
  where: { id?: string | null; slug?: string | null; episodePageUrl?: string | null },
  selectors: Array<'id' | 'slug' | 'episodePageUrl'> = ['id', 'slug'],
): any {
  for (const selector of selectors) {
    const value = where[selector]
    if (!value) continue
    if (selector === 'id') return { id: value }
    if (selector === 'slug') return { slug: value }
    if (selector === 'episodePageUrl') return { episodePageUrl: value }
  }
  throw new Error(`Provide exactly one of: ${selectors.join(', ')}`)
}

const EPISODE_UNIQUE_SELECTORS = ['id', 'slug', 'episodePageUrl'] as const

/**
 * Resolves Episode unique lookup: exactly one of id, slug, episodePageUrl (non-empty).
 */
export function resolveEpisodeWhereUnique(where: {
  id?: string | null
  slug?: string | null
  episodePageUrl?: string | null
}): { id: string } | { slug: string } | { episodePageUrl: string } {
  const provided = EPISODE_UNIQUE_SELECTORS.filter(name => {
    const v = where[name]
    return v != null && String(v).length > 0
  })
  if (provided.length === 0) {
    throw new Error('Provide exactly one of: id, slug, episodePageUrl')
  }
  if (provided.length > 1) {
    throw new Error('Only one selector is allowed: id, slug, episodePageUrl')
  }
  const name = provided[0]
  const value = where[name] as string
  if (name === 'id') return { id: value }
  if (name === 'slug') return { slug: value }
  return { episodePageUrl: value }
}

/**
 * Builds a Prisma to-one relation operation from a relation operation input.
 */
export function applyToOneRelationOp(
  op: {
    connect?: { id?: string | null; slug?: string | null }
    disconnect?: boolean
    create?: Record<string, unknown>
    connectOrCreate?: {
      where: { id?: string | null; slug?: string | null }
      create: Record<string, unknown>
    }
  } | undefined,
  selectors: Array<'id' | 'slug'> = ['id', 'slug'],
  connectOrCreateSelectors: Array<'id' | 'slug'> = ['slug'],
) {
  if (op === undefined) return undefined
  if (op.disconnect) return { disconnect: true }
  if (op.connect) return { connect: resolveWhere(op.connect, selectors) }
  if (op.create) return { create: op.create }
  if (op.connectOrCreate) {
    return {
      connectOrCreate: {
        where: resolveWhere(op.connectOrCreate.where, connectOrCreateSelectors),
        create: op.connectOrCreate.create,
      },
    }
  }
  return undefined
}

/**
 * Builds a Prisma to-many relation operation from a relation operation input.
 */
export function applyToManyRelationOp(
  op: {
    set?: Array<{ id?: string | null; slug?: string | null }>
    connect?: Array<{ id?: string | null; slug?: string | null }>
    disconnect?: Array<{ id?: string | null; slug?: string | null }>
    create?: Array<Record<string, unknown>>
    connectOrCreate?: Array<{
      where: { id?: string | null; slug?: string | null }
      create: Record<string, unknown>
    }>
  } | undefined,
  selectors: Array<'id' | 'slug'> = ['id', 'slug'],
  connectOrCreateSelectors: Array<'id' | 'slug'> = ['slug'],
) {
  if (op === undefined) return undefined
  const result: any = {}
  if (op.set) result.set = op.set.map(where => resolveWhere(where, selectors))
  if (op.connect) result.connect = op.connect.map(where => resolveWhere(where, selectors))
  if (op.disconnect) result.disconnect = op.disconnect.map(where => resolveWhere(where, selectors))
  if (op.create) result.create = op.create
  if (op.connectOrCreate) {
    result.connectOrCreate = op.connectOrCreate.map(item => ({
      where: resolveWhere(item.where, connectOrCreateSelectors),
      create: item.create,
    }))
  }
  return result
}

export type RelationMutationPlan = {
  data: any
  touched: boolean
  createdEmbeddingCandidates: NestedEmbeddingSyncCandidate[]
}

type SearchableRelationPlanOptions = {
  prisma: GraphQLContext['prisma']
  searchableEntity?: EmbeddingSourceEntity
  mode?: EmbeddingWriteMode
  selectors?: Array<'id' | 'slug'>
  connectOrCreateSelectors?: Array<'id' | 'slug'>
}

function buildCandidateSelector(
  create: Record<string, unknown> | undefined,
  fallbackWhere: { id?: string | null; slug?: string | null },
) {
  const id = typeof create?.id === 'string' ? create.id : fallbackWhere.id
  const slug = typeof create?.slug === 'string' ? create.slug : fallbackWhere.slug

  if (!id && !slug) {
    return undefined
  }

  return { id, slug }
}

async function collectConnectOrCreateCandidate(
  op: {
    where: { id?: string | null; slug?: string | null }
    create: Record<string, unknown>
  },
  options: SearchableRelationPlanOptions,
): Promise<NestedEmbeddingSyncCandidate[]> {
  const {
    prisma,
    searchableEntity,
    mode = 'AUTO',
    connectOrCreateSelectors = ['slug'],
  } = options

  if (!searchableEntity) return []

  const delegate = getEmbeddingEntityDelegate(prisma, searchableEntity)
  const where = resolveWhere(op.where, connectOrCreateSelectors)
  const existing = await delegate.findUnique({
    where,
    select: { id: true },
  })

  if (existing) {
    return []
  }

  const selector = buildCandidateSelector(op.create, op.where)
  if (!selector) return []

  return [{
    entity: searchableEntity,
    selector,
    mode,
  }]
}

export async function buildToOneRelationMutationPlan(
  op: {
    connect?: { id?: string | null; slug?: string | null }
    disconnect?: boolean
    create?: Record<string, unknown>
    connectOrCreate?: {
      where: { id?: string | null; slug?: string | null }
      create: Record<string, unknown>
    }
  } | undefined,
  options: SearchableRelationPlanOptions,
): Promise<RelationMutationPlan> {
  const data = applyToOneRelationOp(
    op,
    options.selectors,
    options.connectOrCreateSelectors,
  )
  const createdEmbeddingCandidates: NestedEmbeddingSyncCandidate[] = []

  if (options.searchableEntity && op?.create) {
    const selector = buildCandidateSelector(op.create, {})
    if (selector) {
      createdEmbeddingCandidates.push({
        entity: options.searchableEntity,
        selector,
        mode: options.mode ?? 'AUTO',
      })
    }
  }

  if (options.searchableEntity && op?.connectOrCreate) {
    createdEmbeddingCandidates.push(
      ...(await collectConnectOrCreateCandidate(op.connectOrCreate, options)),
    )
  }

  return {
    data,
    touched: op !== undefined,
    createdEmbeddingCandidates,
  }
}

export async function buildToManyRelationMutationPlan(
  op: {
    set?: Array<{ id?: string | null; slug?: string | null }>
    connect?: Array<{ id?: string | null; slug?: string | null }>
    disconnect?: Array<{ id?: string | null; slug?: string | null }>
    create?: Array<Record<string, unknown>>
    connectOrCreate?: Array<{
      where: { id?: string | null; slug?: string | null }
      create: Record<string, unknown>
    }>
  } | undefined,
  options: SearchableRelationPlanOptions,
): Promise<RelationMutationPlan> {
  const data = applyToManyRelationOp(
    op,
    options.selectors,
    options.connectOrCreateSelectors,
  )
  const createdEmbeddingCandidates: NestedEmbeddingSyncCandidate[] = []

  if (options.searchableEntity && op?.create) {
    for (const create of op.create) {
      const selector = buildCandidateSelector(create, {})
      if (!selector) continue

      createdEmbeddingCandidates.push({
        entity: options.searchableEntity,
        selector,
        mode: options.mode ?? 'AUTO',
      })
    }
  }

  if (options.searchableEntity && op?.connectOrCreate) {
    for (const candidate of op.connectOrCreate) {
      createdEmbeddingCandidates.push(
        ...(await collectConnectOrCreateCandidate(candidate, options)),
      )
    }
  }

  return {
    data,
    touched: op !== undefined,
    createdEmbeddingCandidates,
  }
}
