import type { CodegenConfig } from '@graphql-codegen/cli'

/**
 * GraphQL Codegen configuration.
 *
 * Pulls the schema directly from the running humanupgradeapi (default:
 * http://localhost:4000/api/graphql in dev).
 *
 * After API schema changes:
 *   pnpm codegen
 *
 * Or in dev with auto-regeneration:
 *   pnpm codegen:watch
 */

const SCHEMA_URL =
  process.env.GRAPHQL_CODEGEN_SCHEMA_URL ??
  process.env.NEXT_PUBLIC_GRAPHQL_URL ??
  'http://localhost:4000/api/graphql'

const config: CodegenConfig = {
  overwrite: true,
  schema: SCHEMA_URL,
  documents: ['app/**/*.{ts,tsx,graphql}', 'components/**/*.{ts,tsx,graphql}', 'lib/**/*.{ts,tsx,graphql}'],
  generates: {
    'lib/gql/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
      },
      config: {
        useTypeImports: true,
        scalars: {
          DateTime: 'string',
          Decimal: 'string',
          JSON: 'unknown',
          Vector: 'number[]',
        },
      },
    },
  },
  ignoreNoDocuments: true,
}

export default config
