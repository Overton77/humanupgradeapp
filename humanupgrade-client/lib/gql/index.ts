/**
 * Single entrypoint for all GraphQL operation types + the typed `gql`
 * template literal.
 *
 * Usage:
 *   import { gql } from '@/lib/gql'
 *   import { GetEpisodeDocument, type GetEpisodeQuery } from '@/lib/gql'
 *
 * The actual generated artifacts live in __generated__/. We keep the import
 * path stable here so changes to codegen output don't ripple.
 */
export { gql } from './__generated__/gql'
export * from './__generated__/graphql'
