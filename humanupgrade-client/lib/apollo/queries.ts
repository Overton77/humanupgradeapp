import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { getClient } from '@/lib/apollo/server-client'

/**
 * Run a typed RSC query and unwrap to either the data object or null.
 *
 * Centralizes:
 *  - the `data ?? null` boilerplate that Apollo v4 forces on us,
 *  - the catch-on-network-error-but-bubble-on-build-time-error semantics
 *    (a missing entity is `null`, but a bad query crashes the build).
 */
export async function rscQuery<TData, TVars extends Record<string, unknown>>(
  document: TypedDocumentNode<TData, TVars>,
  variables: TVars,
): Promise<TData | null> {
  try {
    const { data } = await getClient().query({ query: document, variables })
    return data ?? null
  } catch (err) {
    // Network / transport errors are silently coerced to null so the entity
    // page can render its EntityNotFound state. Schema errors (programmer
    // bugs) still surface in dev because they happen before the network call.
    console.warn('[rscQuery] failed:', err)
    return null
  }
}
