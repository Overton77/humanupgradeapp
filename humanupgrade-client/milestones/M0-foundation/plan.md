# M0 — Foundation

> **Status:** 🟦 planning · **Roadmap target:** ~1 week
> **Schema PRs needed (API):** none (no model changes) · **Client PRs:** initial scaffold + first deploy

## Goal

Anonymous visitors land on a marketing page, sign up via Clerk, hit the workbench shell, run a global search like *"HRV"*, and click into any of the 10 entity types — Episode, Compound, Product, Case Study, etc. — backed by the **already-deployed `humanupgradeapi`**, all rendered through the workbench's three-pane layout, and shipped on Vercel via preview deploys per PR.

This milestone is foundational plumbing **plus** real product surface — no fake screens, no mocks. By the end, the app is browseable.

## Scope

**In:**
- Convert `humanupgradeapp/` into a real **pnpm monorepo** with three packages: `humanupgradeapi`, `humanupgrade-client`, and `packages/db-types`.
- Single GitHub repo for the monorepo. **Two Vercel projects** pointing at the same repo, each with its own `rootDirectory`.
- Next.js 15 + Tailwind v4 + shadcn/ui scaffold for the client.
- AI Elements installed into `components/ai-elements/`.
- Apollo Client + GraphQL Codegen wired to the live `humanupgradeapi` GraphQL endpoint.
- All 10 public entity detail pages (`/e/...`), read-only, using the wireframes in [docs/04 §2](../../docs/04-layouts-wireframes.md#2-entity-detail--episode-eepisodesslug) as the reference for the Episode page; lighter layouts for the others.
- Global search header (B1) — hits the API's existing hybrid search.
- Workbench shell (3-pane resizable, left = nav, center = current, right = empty placeholder for the assistant — assistant ships in M2). Shell is the gated `(app)` layout.
- Public marketing page at `/`, sign-up + sign-in CTAs (Clerk components only — no protected routes yet beyond the workbench shell).
- `proxy.ts` with `clerkMiddleware()` and the Workflow SDK matcher exclusion ready for later milestones.
- `next.config.ts` wrapped with `withWorkflow()` (free for later — no workflows yet in this milestone).
- Vercel preview deploys per PR for both projects.
- Sentry + Vercel Analytics enabled on the client.
- Environment variables wired (read from `.availabe.env`).

**Out (defer):**
- All user-owned models (`SavedEntity`, `Note`, etc.) → M1 onward.
- Any AI assistant code → M2 onward.
- Any workflow runs → M2.5 onward.
- Wearable integrations, biomarker tracking, protocols, journey, gamification — later milestones.
- A real Clerk JWT template + API verification → M1 (the bridge isn't *needed* until we make our first authenticated GraphQL mutation).

## Deliverables

### Workspace + repo
- [ ] **D1** — Promote `humanupgradeapp/` to a pnpm monorepo:
  - `humanupgradeapp/pnpm-workspace.yaml` lists `humanupgradeapi`, `humanupgrade-client`, `packages/*`.
  - `humanupgradeapp/package.json` (root) with shared scripts (`dev`, `build`, `lint`, `typecheck`, `codegen`).
  - Root `.gitignore`, `.editorconfig`, `.nvmrc` (Node 22).
- [ ] **D2** — Single git repo at `humanupgradeapp/`, pushed to a new GitHub repo (e.g. `Overton77/humanupgradeapp`). The legacy API repo (`humanupgradebiotechapi`) is archived with a README pointing to the new monorepo. **Decision needed before build:** preserve API history via `git subtree` import, or accept a fresh-start initial commit.
- [ ] **D3** — `packages/db-types` package: thin TS-only package that re-exports the API's Prisma-generated types (model types + enums). The API runs `prisma generate` as today; a `postinstall` (or root `pnpm db-types:build` script) copies `humanupgradeapi/generated/{enums.ts, models.ts}` into `packages/db-types/src/index.ts` (or simply re-exports from `../humanupgradeapi/generated/index.ts` via TS path mapping). **Runtime Prisma client stays inside the API.**

### Vercel
- [ ] **D4** — Reconfigure existing API Vercel project (`humanupgradeapi`, `prj_BPkYIbKkxTpzshyXB3Wwzo5lrkjY`):
  - Re-link to the new GitHub repo.
  - Set `rootDirectory: humanupgradeapi`.
  - Verify build still works; smoke-test `/graphql`.
- [ ] **D5** — Create new Vercel project `humanupgrade-client`:
  - Same GitHub repo.
  - `rootDirectory: humanupgrade-client`.
  - Framework: Next.js.
  - Env vars: see env section below.
  - Preview deploy per PR confirmed.

### Client scaffold
- [ ] **D6** — Next.js 15 App Router app in `humanupgrade-client/`:
  - `npx create-next-app@latest .` with TypeScript, ESLint, Tailwind v4, App Router, `src/` = no, alias `@/*`.
  - **`proxy.ts`** at project root (NOT `middleware.ts`) with `clerkMiddleware()` and Workflow SDK exclusion.
  - **`next.config.ts`** wrapped with `withWorkflow()`.
  - **`tsconfig.json`** with workflow plugin and `@/*` paths.
- [ ] **D7** — Tailwind v4 + shadcn/ui initialized (`pnpm dlx shadcn@latest init`); install primitives: `button card input dialog scroll-area dropdown-menu separator badge tooltip tabs sonner skeleton`.
- [ ] **D8** — AI Elements installed (`pnpm dlx ai-elements@latest`). Even though M0 has no assistant code, this sets up `components/ai-elements/` and components.json correctly so M2 doesn't fight config.
- [ ] **D9** — Resizable panes via `react-resizable-panels`; initial layout component reads/writes localStorage (PaneLayout DB persistence is M4). DnD via `@dnd-kit/core` installed but not wired yet.

### Auth (Clerk — no API integration this milestone)
- [ ] **D10** — Clerk installed (`@clerk/nextjs`):
  - `<ClerkProvider>` wraps `app/layout.tsx` body.
  - Header uses `<Show when="signed-out">` (`<SignInButton mode="modal">`, `<SignUpButton mode="modal">`) and `<Show when="signed-in">` (`<UserButton afterSignOutUrl="/" />`).
  - `proxy.ts` already has `clerkMiddleware()` from D6.
  - `(app)/layout.tsx` calls `await auth.protect()` to gate the workbench shell.
  - Env: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` set.
  - **No webhook yet, no local `User` table yet** — the bridge to the API is M1's job. Workbench shell is gated; what's inside it is just the public entity browser.

### Data layer
- [ ] **D11** — Apollo Client + RSC integration:
  - `@apollo/client@^4` + `@apollo/client-integration-nextjs`.
  - `lib/apollo/server-client.ts` — `registerApolloClient(makeClient)` for RSC.
  - `lib/apollo/browser-client.ts` — `ApolloNextAppProvider` for client components.
  - HTTP link → `process.env.NEXT_PUBLIC_GRAPHQL_URL` (point at production API for now since that's what's deployed; a future `pnpm dev:api` script will let us point at `http://localhost:4000/graphql`).
- [ ] **D12** — GraphQL Codegen (`@graphql-codegen/cli` + `@graphql-codegen/client-preset`):
  - `codegen.ts` config pointing at the live API schema URL.
  - `pnpm codegen` script generates `lib/gql/` (typed `gql` template literal + types).
  - First-pass: write the queries needed for the 10 entity pages and the search bar.

### Public entity browsing (the real product surface)
- [ ] **D13** — Routes for all 10 entity types under `app/e/`:
  - `app/e/podcasts/[slug]/page.tsx`
  - `app/e/episodes/[slug]/page.tsx`
  - `app/e/claims/[id]/page.tsx`
  - `app/e/people/[slug]/page.tsx`
  - `app/e/organizations/[slug]/page.tsx`
  - `app/e/products/[slug]/page.tsx`
  - `app/e/compounds/[slug]/page.tsx`
  - `app/e/lab-tests/[slug]/page.tsx`
  - `app/e/biomarkers/[slug]/page.tsx`
  - `app/e/case-studies/[slug]/page.tsx`
  - All RSC, fetched via the registered Apollo client.
- [ ] **D14** — Reusable `<EntityCard />`, `<EntityHeader />`, `<RelationRail />` components in `components/entity/` so each detail page is mostly composition.
- [ ] **D15** — Episode page is the *reference implementation*: header + transcript region + claim list + sponsors + guests + 1-hop relation rail (per [docs/04 §2](../../docs/04-layouts-wireframes.md#2-entity-detail--episode-eepisodesslug)). Other pages get a lighter version that we'll polish in later milestones.
- [ ] **D16** — Empty / loading / error states for every entity page (skeletons via shadcn).

### Search (B1)
- [ ] **D17** — Header search component opens a `<Dialog />` (proxy for the eventual `⌘K` palette). Calls a `globalSearch` query that fans out to the existing per-entity hybrid search resolvers (or a single multi-entity resolver if it exists; if not, fan out client-side and group results).
- [ ] **D18** — `/search?q=...` route (per [docs/03](../../docs/03-information-architecture.md)) renders grouped results with deep-links to entity pages. Filters per entity type ship in M2 onward.

### Observability
- [ ] **D19** — Sentry installed in the client (`@sentry/nextjs`); source maps uploaded on production builds.
- [ ] **D20** — Vercel Analytics + Speed Insights enabled.

## API work — `humanupgradeapi`

This milestone has **no Prisma schema changes** and **no new resolvers**. We're consuming what already exists. Things we may need to do in the API repo:

1. **Re-link the Vercel project** to the new monorepo (D4).
2. **Verify a `globalSearch` resolver exists** that takes `{ query, limit }` and returns hits across entity types. If not, **either:**
   - Add a thin `Query.search(query, limit)` resolver that internally calls each existing per-entity hybrid search and tags hits with their type — this lives in `src/graphql/resolvers/query.ts`, no schema changes, just a new field; **OR**
   - Have the client fan out N parallel queries (one per entity type) and group on the client. **Decision before build:** which approach?
3. **CORS** — confirm the existing API allows the client's preview-deploy origins (`*.vercel.app`) in addition to its own origin.
4. **Health endpoint** — confirm `GET /health` exists for Vercel and Sentry uptime monitoring; add if not.

> Anything beyond this in the API is out of scope for M0 and waits for M1 (where we add `User`, `Folder`, `SavedEntity`, `Note`, `Highlight`, `UserFile`).

## Client work — `humanupgrade-client`

Order matters; this is the build sequence:

1. **Monorepo setup** (D1, D2, D3).
2. **Next.js scaffold** (D6) — verify `pnpm dev` runs the empty app.
3. **Tailwind + shadcn + AI Elements** (D7, D8).
4. **Clerk** (D10) — verify sign-in modal works.
5. **Apollo + Codegen** (D11, D12) — first query against live API confirms the wire.
6. **Entity detail pages** (D13, D14, D15, D16).
7. **Search** (D17, D18).
8. **Workbench shell** (D9) wraps `(app)/layout.tsx` so `/e/...` pages render inside the shell when accessed through the gated app namespace; standalone `/e/...` deep-links render in a public layout.
9. **Sentry + Analytics** (D19, D20).
10. **Vercel deploy** (D5) — preview deploy per PR.

## Environment variables for M0

In `humanupgrade-client/.env.local` (mirrored into Vercel project settings):

```
NEXT_PUBLIC_GRAPHQL_URL=https://<live-api-vercel-domain>/graphql
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
SENTRY_AUTH_TOKEN=
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

Other env vars listed in [docs/09 §Environment variables](../../docs/09-tech-stack.md#environment-variables) are defined but **unused** in M0 (added in their owning milestones).

## Risks & open questions

| # | Risk / question | Resolution proposal |
|---|---|---|
| R1 | Git history preservation when promoting to monorepo | **Recommend a fresh initial commit** in the new monorepo; archive the legacy `humanupgradebiotechapi` repo with a README pointing to the new one. Lower risk than `git subtree` import. |
| R2 | The API uses Prisma 7's new driver-adapter pattern (`@prisma/adapter-pg`) — `db-types` package mechanics differ from Prisma 5/6 | We'll re-export from `humanupgradeapi/generated/client.js` (the existing output dir per `prisma.config.ts`). The client only consumes types, never the runtime. |
| R3 | `globalSearch` resolver may not exist in the API | Decide: add a thin server-side fan-out resolver (preferred — one round trip) vs client-side fan-out. **Defaulting to API resolver.** |
| R4 | API Vercel project re-linking might require disconnecting the old GitHub integration | Standard Vercel flow; one-time disruption window. Schedule deploy during low-traffic window (or accept brief downtime since pre-launch). |
| R5 | Apollo Client v4 changed RSC patterns vs v3 | Skill / docs check at build time; the `@apollo/client-integration-nextjs` package follows the latest pattern — pin during build. |
| R6 | Bedrock / Mem0 / Tavily / Workflow envs are unused in M0 but show in the env list | Document them as "set but unused until M2/M3" so Vercel doesn't error on missing values. |
| R7 | Clerk publishable + secret keys must be created in the Clerk dashboard | **You** to create app, share keys. Otherwise blocking. |

## Definition of Done

- [ ] All deliverables (D1–D20) checked.
- [ ] API still deploys + serves GraphQL from its new `rootDirectory`.
- [ ] Client preview deploys on every PR.
- [ ] Anonymous user can land on `/`, click "Sign up", complete Clerk flow, land in `(app)` workbench shell.
- [ ] Anonymous user can search "HRV" and reach an Episode detail page.
- [ ] Each of the 10 entity types has a live, render-able detail URL backed by real API data.
- [ ] Playwright e2e: `home → search "HRV" → click first episode → see transcript & claim count` passes.
- [ ] `delta.md` written with actually-shipped surface + commits.
- [ ] `INDEX.md` updated to ✅ done.

## Pre-build approvals needed from you

Before I move from 🟦 planning → 🟡 in-progress, please confirm:

1. **R1 (git):** Fresh initial commit in new monorepo, archive legacy repo? (Yes/No)
2. **R3 (search):** Add server-side `Query.search` resolver in API, or fan out from client? (Server / Client)
3. **R7 (Clerk):** You'll create the Clerk app and share publishable + secret keys? (Yes/No)
4. **GitHub repo name:** `Overton77/humanupgradeapp` OK? Or different?
5. **Vercel client project name:** `humanupgrade-client` OK? Or different?
