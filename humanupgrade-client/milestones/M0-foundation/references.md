# M0 — References

## Internal docs

- `humanupgrade-client/index.md` — project rules of the road (Clerk, Mem0, providers, AI SDK skill override).
- `humanupgrade-client/docs/01-vision.md`
- `humanupgrade-client/docs/02-feature-spec.md` — A1 (Clerk auth), B1 (global search).
- `humanupgrade-client/docs/03-information-architecture.md` — `/e/...` route map, gating boundaries.
- `humanupgrade-client/docs/04-layouts-wireframes.md` §1 (workbench), §2 (Episode page), §7 (search results).
- `humanupgrade-client/docs/09-tech-stack.md` — entire doc; especially Auth, Model providers, repo layout, env vars.
- `humanupgrade-client/docs/10-scope-roadmap.md` — Milestone 0 scope.

## API source files inspected

- `humanupgradeapi/package.json`
- `humanupgradeapi/.vercel/project.json`
- `humanupgradeapi/prisma.config.ts`
- `humanupgradeapi/prisma/schema.prisma`
- `humanupgradeapi/pnpm-workspace.yaml`
- `humanupgradeapi/src/search/entitySearchTypes.ts`

## Skills consulted

- `humanupgrade-client/.agents/skills/ai-elements/SKILL.md`
- `humanupgrade-client/.agents/skills/ai-sdk/SKILL.md` — only for noting the project's project-rule override of "use AI Gateway"; AI SDK code does not ship in M0.

## External docs

- Clerk Next.js quickstart — https://clerk.com/docs/nextjs/getting-started/quickstart
- Workflow SDK — Next.js getting started — https://workflow-sdk.dev/docs/getting-started/next (for the `proxy.ts` matcher pattern)
- AI Elements — https://www.npmjs.com/package/ai-elements
- shadcn/ui — https://ui.shadcn.com/
- Apollo Client + Next.js (RSC) — https://www.apollographql.com/docs/react/data/integrations/next-js/
- GraphQL Codegen client preset — https://the-guild.dev/graphql/codegen/plugins/presets/preset-client
- Vercel multi-project from monorepo — https://vercel.com/docs/monorepos
- Sentry Next.js — https://docs.sentry.io/platforms/javascript/guides/nextjs/

## Past chats

- [HumanUpgrade spec & architecture (this thread)](75c4b5f0-1748-4f2b-9c5b-2ca4c5b91c52)

> Replace the UUID above with the real chat id once it's known. Also add follow-up chats here as they happen.
