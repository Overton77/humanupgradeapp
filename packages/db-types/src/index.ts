/**
 * @humanupgrade/db-types
 *
 * Shared, type-only re-exports from the humanupgradeapi Prisma client.
 *
 * The runtime Prisma client (`@prisma/client`) NEVER crosses this boundary.
 * Only the generated TypeScript types do. The API is the single source of
 * truth for the database schema; the client consumes these types so its
 * GraphQL Codegen output and AI tool schemas can stay in sync without
 * importing the runtime engine.
 *
 * Update flow:
 *  1. Edit `humanupgradeapi/prisma/schema.prisma`
 *  2. `pnpm prisma:migrate`  → runs `prisma migrate dev` in the API package
 *  3. `pnpm prisma:generate` → regenerates `humanupgradeapi/generated/`
 *  4. Consumers (humanupgrade-client) get fresh types via TS path mapping
 *     (see tsconfig path: `@humanupgrade/db-types`).
 */

export * from './enums.js'
export * from './models.js'
