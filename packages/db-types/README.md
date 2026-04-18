# @humanupgrade/db-types

Shared **type-only** re-exports from the `humanupgradeapi` Prisma-generated client.

## Why

`humanupgrade-client` needs to know what `EpisodeWhereUniqueInput`, `Goal`, `TimeLayer`, etc. *look like* — but it must NOT pull in the runtime Prisma engine (it doesn't talk to Postgres directly; it talks to the API via GraphQL).

This package gives the client TypeScript types without dragging in `@prisma/client` or its native engine binaries.

## Usage

In `humanupgrade-client`:

```ts
import type { Goal, TimeLayer, ProtocolStatus } from '@humanupgrade/db-types/enums'
import type { Episode, Compound } from '@humanupgrade/db-types/models'
```

## Update flow

1. Edit `humanupgradeapi/prisma/schema.prisma`.
2. From the workspace root: `pnpm prisma:migrate` (creates a migration + applies to dev DB).
3. `pnpm prisma:generate` (regenerates `humanupgradeapi/generated/`).
4. Consumers automatically pick up new types — `db-types` is just a stable re-export layer.

## Why a package and not a tsconfig path

A package boundary keeps the client honest: it can never accidentally `import { PrismaClient } from '@prisma/client'`. The `@humanupgrade/db-types` package only exposes the type surface.
