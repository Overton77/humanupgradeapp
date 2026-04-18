# M1 — References

## Internal docs (read in this order)

1. `humanupgrade-client/index.md` — project rules of the road. Note rules #2 (no AI Gateway), #8 (Clerk middleware specifics), #9 (Mem0).
2. `humanupgrade-client/docs/02-feature-spec.md`
   - §A — onboarding (A1–A5)
   - §C — entity browsing & relations (C2 inverse relations are already shipped; C7 highlights is M1 work)
   - §D — personal library (D1–D7)
3. `humanupgrade-client/docs/03-information-architecture.md` — gating boundaries, route map under `/library/...`.
4. `humanupgrade-client/docs/04-layouts-wireframes.md` — §1 (workbench home), §8 (notes editor) — what M1 should ship visually.
5. `humanupgrade-client/docs/05-ai-assistant.md` — only §3 (model resolver) and §5 (tool authoring) — context for how M2 will consume your `saveEntity` mutation; you don't ship AI in M1.
6. `humanupgrade-client/docs/08-data-model-additions.md`
   - §1 (enums) — `Goal`, `HealthFlag`, `SavedEntityType`, `HighlightSourceType`, `FileKind` are M1 scope.
   - §2 (User & Profile)
   - §3 (Saves, Notes, Highlights, Files)
   - §10 (Migration strategy) — **PR 1 is your scope**.
7. `humanupgrade-client/docs/09-tech-stack.md`
   - §Auth — Clerk (the canonical Clerk wiring spec; `requireUser`/`requireUserId` helpers + webhook handler).
   - §Apollo + RSC.
   - §Mem0 — for context only (M2 wires it; not your problem).
8. `humanupgrade-client/docs/10-scope-roadmap.md` — Milestone 1 detailed checklist.

## M0 artifacts to study

- `humanupgrade-client/milestones/M0-foundation/plan.md` — see how the previous milestone was structured.
- `humanupgrade-client/milestones/M0-foundation/delta.md` — what shipped, including the **post-M0 entity-index patch** (relevant: your library left pane should follow the same `EntityIndexShell` pattern; the user-saved version is just a different data source).
- `humanupgrade-client/milestones/M0-foundation/research.md` — same conventions still apply.

## Code to mirror

- `humanupgradeapi/src/graphql/resolvers/globalSearch.ts` — pattern for a new resolver module that lives outside the entity-resolver files.
- `humanupgradeapi/src/graphql/resolvers/biomarker.ts` (or any other entity resolver) — the per-entity field-resolver + DataLoader pattern.
- `humanupgradeapi/src/validation/biomarker.ts` — Zod input/output convention.
- `humanupgrade-client/lib/gql/documents/list/listEpisodes.graphql` — query file convention.
- `humanupgrade-client/components/entity-index/EntityIndexShell.tsx` — page chrome pattern; reuse for library views.
- `humanupgrade-client/lib/apollo/queries.ts` — `rscQuery()` helper. You'll add `rscMutation()` (and a `useAuthenticatedMutation` browser hook).

## Skills

- `humanupgrade-client/.agents/skills/ai-elements/SKILL.md` — only relevant if you build a notes editor that uses any AI elements (e.g. `Suggestion`); probably not needed in M1.
- The `ai-sdk` skill is irrelevant for M1 (you don't ship AI yet).

## External docs

- **Clerk Next.js v7** — https://clerk.com/docs/nextjs/getting-started/quickstart
- **Clerk JWT templates** — https://clerk.com/docs/backend-requests/making/jwt-templates
- **`@clerk/backend` token verification** — https://clerk.com/docs/references/backend/verify-token
- **Clerk webhooks (Svix)** — https://clerk.com/docs/integrations/webhooks/sync-data
- **Apollo Server 5 — context function** — https://www.apollographql.com/docs/apollo-server/data/context
- **Apollo Client 4 — auth link** — https://www.apollographql.com/docs/react/networking/authentication
- **Prisma 7 driver-adapter (already in use)** — https://www.prisma.io/docs/orm/overview/databases/postgresql

## Past chats (cite-able)

- [HumanUpgrade architecture & M0 close](75c4b5f0-1748-4f2b-9c5b-2ca4c5b91c52)
  *(Replace this UUID with the actual chat id when you cite it. The agent transcript folder lives outside the repo.)*
