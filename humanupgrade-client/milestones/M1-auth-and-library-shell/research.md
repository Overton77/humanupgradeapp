# M1 — Bootstrap research notes (from the M0-closing agent)

These are the things you'll discover anyway by exploring — captured here so you don't have to re-derive them.

## What M0 actually shipped (relevant to your work)

- **Monorepo** at `humanupgradeapp/` with three pnpm packages:
  `humanupgradeapi/`, `humanupgrade-client/`, `packages/db-types/`.
  Always run pnpm from the root (`pnpm -F humanupgrade-client …`, `pnpm -F humanupgradeapi …`, or root scripts like `pnpm dev:client`).
- **API is live locally on port 4000.** Sandbox at `/graphql`, GraphQL endpoint at `/api/graphql`, health at `/api/health`.
- **Client is on port 3000.** `NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/api/graphql` is in `humanupgrade-client/.env`.
- **Clerk v7.2.3 is installed and partially wired**:
  - `<ClerkProvider afterSignOutUrl="/">` wraps `<body>` in `app/layout.tsx`.
  - `middleware.ts` (NOT `proxy.ts` — Clerk v7 still sniffs `middleware.ts`) uses `clerkMiddleware()` with a public-route allowlist (`/`, `/search(.*)`, `/e/(.*)`, `/api/webhooks/(.*)`, `/api/health`). Everything else is gated.
  - `(app)/layout.tsx` has `await auth.protect()` as defense-in-depth.
  - `<Show when="signed-in/-out">` + `<UserButton>` + `<SignInButton>` + `<SignUpButton>` are used in the marketing header.
  - **No `User` table yet, no webhook yet, no Clerk-to-API token bridge yet.** All of that is your work.
- **Apollo Client v4** with `@apollo/client-integration-nextjs`. RSC client at `lib/apollo/server-client.ts` (`getClient()`, `rscQuery()`); browser provider at `lib/apollo/browser-provider.tsx`. Both currently send GraphQL requests with NO auth headers — your bridge needs to add them.
- **GraphQL Codegen** runs against the live local API and writes to `lib/gql/__generated__/`. The barrel re-export is `lib/gql/index.ts`. Fragment masking is OFF (parent queries see fragment fields directly).
- **shadcn/ui (new-york, Tailwind v4)** + **AI Elements** (M2/M3 surface) installed under `components/ui/` and `components/ai-elements/`. Pre-installed primitives: button, card, input, dialog, dropdown-menu, separator, badge, tooltip, tabs, sonner, skeleton, scroll-area + transitive (alert, button-group, carousel, collapsible, command, hover-card, input-group, select, spinner, textarea).
- **3-pane workbench** at `/workbench` (gated). Left pane is `LibraryPanePlaceholder` — replace it.
- **All 10 entity detail pages** at `/e/<type>/[slug-or-id]` use `EntityActions` (`Save` / `Share` / `Ask AI`). Save and Ask AI are toast-only stubs that say "coming in M1/M2"; Share works (clipboard).
- **All 10 entity index pages** at `/e/<type>` (just shipped — see "Post-M0 patch" in `milestones/M0-foundation/delta.md`).
- **`@humanupgrade/db-types`** workspace package re-exports the API's Prisma generated `enums.ts` + `models.ts`. Use `import type { Goal, HealthFlag } from '@humanupgrade/db-types/enums'` etc.

## Key conventions in the codebase

These are mostly captured in `docs/09` but worth concentrating here:

1. **Folder layout follows feature, not type.** `components/entity-index/`, `components/episode/`, `components/marketing/` — not `components/cards/` + `components/forms/`. Co-locate small helpers; lift to `components/ui/` only if shadcn-shaped.
2. **Pure utils never import React.** See `lib/utils/format.ts`, `lib/entity-index/params.ts`. They're easy to test.
3. **Pages stay thin.** Page files compose components and pass data; they shouldn't have layout markup beyond a top-level shell. See `app/e/episodes/page.tsx` for the pattern.
4. **GraphQL operations live in `.graphql` files**, not inline `gql\`…\`` template literals. The codegen output is the single source of types.
5. **`getModel(tier)` — never hardcode model IDs**. Defined in (will be defined in) `lib/ai/model.ts`. M0 hasn't created this file yet because no AI code ships in M0; M1 still doesn't ship AI code, but if you find yourself needing a model anywhere, USE THIS HELPER (M2 spec'd it in `docs/05` §3).
6. **No NextAuth references.** Anywhere you see `requireSession`, `session.user.id`, etc., flag and replace with Clerk equivalents.
7. **Errors are useful.** Resolvers throw `GraphQLError` with `extensions.code`. Client surfaces them via the `app/e/error.tsx` boundary (or a route-local one).
8. **Commits**: Conventional Commits (`feat(area):`, `chore(area):`, etc.). Multi-line bodies via heredoc per `git/COMMIT_EDITMSG`.

## Things that bit M0 you should know about

- **Clerk v7 changed `<UserButton afterSignOutUrl>` away from a prop.** Set `afterSignOutUrl` on `<ClerkProvider>` instead.
- **GraphQL Codegen enums are PascalCase** (`SearchMode.Hybrid`, `GlobalSearchEntityType.Episode`). Not `'HYBRID'`.
- **Next.js 15.5+ renamed `middleware.ts` → `proxy.ts`** but **Clerk v7 still expects `middleware.ts`**. Stay on `middleware.ts` until Clerk catches up.
- **Apollo v4** returns `query.data` as `T | undefined`, not `T`. Always `?? null` at the boundary; see `rscQuery()` in `lib/apollo/queries.ts`.
- **shadcn `Badge` has a `ghost` variant** (used in `FilterBar` "Clear filters"). Don't worry that you only see it in markup.
- **The legacy API repo** (`Overton77/humanupgradebiotechapi`) is unused — the monorepo replaced it. `humanupgradeapi/.git-legacy-backup/` is a local-disk backup; ignore it.

## API structure quick reference

For when you write Schema PR 1 + new resolvers:

```
humanupgradeapi/
├── prisma/
│   ├── schema.prisma            ← edit here for Schema PR 1
│   └── migrations/              ← prisma migrate dev creates new ones
├── prisma.config.ts
├── src/
│   ├── server.ts                ← Apollo Server 5 + Express setup
│   ├── lib/
│   │   ├── prisma.ts            ← shared Prisma client
│   │   └── context.ts           ← GraphQLContext shape (you'll add `user` here)
│   ├── loaders/                 ← DataLoader instances
│   ├── search/
│   │   ├── entitySearchService.ts
│   │   ├── entitySearchTypes.ts
│   │   └── embeddings/
│   ├── validation/              ← Zod input/output schemas (one per entity)
│   └── graphql/
│       ├── schema.graphql       ← single SDL file
│       ├── resolvers/
│       │   ├── index.ts         ← merges resolver modules
│       │   ├── query.ts
│       │   ├── mutation.ts
│       │   ├── globalSearch.ts  ← M0 addition
│       │   └── <entity>.ts      ← per-entity field resolvers + DataLoader hooks
│       └── operations/          ← legacy local .graphql files (existing)
```

## What I would do if I were planning M1 (suggestions, not constraints)

- **Land Schema PR 1 first.** Empty resolvers stubbed (return null / empty arrays). Then wire Clerk webhook so user rows actually exist. Then build the bridge. Then build mutations. Then build UI.
- **Auth bridge approach (recommended):**
  - Server: `humanupgradeapi/src/lib/auth.ts` — `verifyClerkJwt(token)` using `@clerk/backend`'s `verifyToken()`. Cache JWKS.
  - Server: extend `GraphQLContext` to `{ prisma, loaders, user: User | null }`. Resolver helper: `requireUser(ctx)` throws `GraphQLError('UNAUTHENTICATED')`.
  - Client: Apollo link that fetches `await session.getToken({ template: 'humanupgrade-api' })` and adds `Authorization: Bearer <token>` to every operation.
- **Webhook**: use `svix` to verify the signature. Create UserProfile in the same tx. Set `notificationPrefs: {}`.
- **Onboarding**: simple multi-step page with React Hook Form + Zod, posts to a `Mutation.completeOnboarding(input)` mutation that fills `UserProfile` and sets `onboardedAt = now()`. Redirect from `(app)` to `/onboarding` if `onboardedAt is null`.
- **Library left pane**: a tabbed component (`Saved` / `Notes` / `Highlights` / `Files`) that fetches from new `Query.mySavedEntities` / `myNotes` / etc.
- **Save button optimistic update**: use Apollo's `optimisticResponse`. Toast on success.

## Stuff explicitly out of M1's scope

(Don't accidentally pull these in — they have their own milestones.)

- AI assistant in any form → **M2**.
- Workflow SDK / durable agents → **M2.5**.
- Protocols, biomarker tracking, long-running AI tools → **M3**.
- Journey / XP / Mem0 wiring → **M4** (Mem0 lands with the assistant in M2 actually — see docs/09).
- Gamification badges → **M4**.
- Vercel deploy of the client → user follow-up (D5 from M0; not blocking).
