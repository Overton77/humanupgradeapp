# HumanUpgrade

A precision biohacking workbench. Monorepo containing:

| Package | Description |
|---|---|
| [`humanupgradeapi`](./humanupgradeapi) | GraphQL API (Apollo Server 5 + Express + Prisma 7 on Postgres + pgvector). Deployed to Vercel. |
| [`humanupgrade-client`](./humanupgrade-client) | Next.js 15 App Router client (Clerk auth, AI SDK v6, Workflow SDK, AI Elements, Apollo Client). Deployed to Vercel. |
| [`packages/db-types`](./packages/db-types) | Shared TypeScript types re-exported from the API's Prisma-generated client. **Types only — never the runtime client.** |

## Getting started

Requires Node 22+ and pnpm 10+.

```bash
# Install everything
pnpm install

# Run the API (port 4000)
pnpm dev:api

# Run the client (port 3000)
pnpm dev:client

# Both in parallel
pnpm dev:api & pnpm dev:client

# Generate Prisma client + db-types
pnpm prisma:generate

# Run a Prisma migration
pnpm prisma:migrate

# GraphQL Codegen for the client (run after API schema changes)
pnpm codegen
```

## Documentation

The product / architecture spec lives in [`humanupgrade-client/`](./humanupgrade-client/index.md):

- [Vision & Pillars](./humanupgrade-client/docs/01-vision.md)
- [Feature Specification](./humanupgrade-client/docs/02-feature-spec.md)
- [Information Architecture](./humanupgrade-client/docs/03-information-architecture.md)
- [Layouts & Wireframes](./humanupgrade-client/docs/04-layouts-wireframes.md)
- [AI Assistant Architecture](./humanupgrade-client/docs/05-ai-assistant.md)
- [Protocols & Tracking](./humanupgrade-client/docs/06-protocols-and-tracking.md)
- [Gamification](./humanupgrade-client/docs/07-gamification-journey.md)
- [Data Model Additions](./humanupgrade-client/docs/08-data-model-additions.md)
- [Tech Stack](./humanupgrade-client/docs/09-tech-stack.md)
- [Scope & Roadmap](./humanupgrade-client/docs/10-scope-roadmap.md)
- [Workflows & Durable Agents](./humanupgrade-client/docs/11-workflows-and-durable-agents.md)
- [AI Elements UI Mapping](./humanupgrade-client/docs/12-ai-elements-mapping.md)

The build status of each milestone lives in [`humanupgrade-client/milestones/INDEX.md`](./humanupgrade-client/milestones/INDEX.md).

## Deployment

Two Vercel projects from the same repo:

| Project | `rootDirectory` | Framework |
|---|---|---|
| `humanupgradeapi` | `humanupgradeapi` | Express |
| `humanupgrade-client` | `humanupgrade-client` | Next.js |

Both share the same Postgres database via `DATABASE_URL`. Only the API talks to Postgres directly (via Prisma); the client talks to the API via GraphQL.
