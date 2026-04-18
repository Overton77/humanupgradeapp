# M0 — Doc deltas

## Files changed in `humanupgrade-client/docs/`

- `index.md` — rule #2 (no AI Gateway), rule #8 (Clerk middleware: still `middleware.ts` not `proxy.ts` because Clerk v7 hasn't picked up the rename yet).
- No major edits to docs 01–12; everything described there is what M0 implements.

## Files changed in `humanupgradeapi/`

- `pnpm-workspace.yaml` — **deleted**, superseded by root one.
- `src/graphql/schema.graphql` — added `GlobalSearchInput`, `GlobalSearchResult`, `GlobalSearchEntityType` enum, and `Query.search(input: GlobalSearchInput!): GlobalSearchResult!`.
- `src/graphql/resolvers/globalSearch.ts` — **new**: `runGlobalSearch(prisma, input)` — fans out to the 10 per-entity hybrid search services in parallel with per-bucket failure isolation.
- `src/graphql/resolvers/query.ts` — wired `Query.search` to `runGlobalSearch`.
- No Prisma schema changes. No migrations.

## Files added at repo root

- `package.json` (workspace root with shared scripts: `dev:api`, `dev:client`, `prisma:generate`, `codegen`, `lint`, `typecheck`, `test`, `format`).
- `pnpm-workspace.yaml` (3 packages: `humanupgradeapi`, `humanupgrade-client`, `packages/*`).
- `.gitignore`, `.editorconfig`, `.nvmrc` (Node 22), `.prettierrc`, `.prettierignore`.
- `README.md`.
- `.vscode/settings.json`.
- `packages/db-types/` — type-only re-export of API's Prisma generated client (`@humanupgrade/db-types`, `@humanupgrade/db-types/enums`, `@humanupgrade/db-types/models`).

## Files added under `humanupgrade-client/`

A complete Next.js 15 + Tailwind v4 + shadcn/ui + AI Elements + Clerk + Apollo + Codegen scaffold. Highlights:

- `app/`
  - `layout.tsx` — ClerkProvider + ApolloWrapper + TooltipProvider + Toaster + Vercel Analytics + Speed Insights.
  - `page.tsx` — marketing home with sign-up CTA + browse rail.
  - `(app)/layout.tsx` + `(app)/workbench/page.tsx` — gated 3-pane workbench with placeholders.
  - `e/{podcasts,episodes,claims,people,organizations,products,compounds,lab-tests,biomarkers,case-studies}/[slug-or-id]/page.tsx` — all 10 detail pages.
  - `e/.../loading.tsx` — skeletons.
  - `e/error.tsx` — entity error boundary.
  - `search/page.tsx` — search results.
- `middleware.ts` — Clerk middleware with public-route allowlist; matcher excludes `.well-known/workflow/` for the future Workflow SDK install.
- `components/ai-elements/` — 17 AI Elements installed (M2/M3 surface).
- `components/ui/` — shadcn primitives (button, card, input, dialog, dropdown-menu, separator, badge, tooltip, tabs, sonner, skeleton, scroll-area + transitive).
- `components/marketing/` — `SiteHeader`, `SiteFooter`.
- `components/workbench/` — `WorkbenchShell`, `AppHeader`, `panes/PanePlaceholder`, `panes/{Library,Center,Assistant}PanePlaceholder`.
- `components/entity/` — `EntityPageShell`, `EntityHeader`, `EntityActions`, `EntityNotFound`, `EntityPageSkeleton`, `RelationRail` + `RelationGroup`, `RelationChip`.
- `components/episode/` — `EpisodeMediaSection`, `EpisodeSummarySection`, `EpisodeTranscriptSection`, `EpisodeClaimsSection`.
- `components/search/` — `GlobalSearchTrigger`, `GlobalSearchDialog`, `GlobalSearchResults`, `SearchResultGroup` + `SearchResultRow`.
- `lib/apollo/` — `server-client.ts` (RSC) + `browser-provider.tsx` + `queries.ts` (`rscQuery` helper).
- `lib/gql/documents/*.graphql` — 12 GraphQL operation files (1 fragments + 1 search + 10 getXxx).
- `lib/gql/__generated__/` — codegen output (gitignored).
- `lib/gql/index.ts` — barrel.
- `lib/entities/routes.ts` — `entityRoutes()` builders.
- `lib/utils/cn.ts`, `lib/utils/format.ts`.
- `hooks/useDebounced.ts`.
- `tests/e2e/headline.spec.ts` + `playwright.config.ts`.
- `codegen.ts`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `tsconfig.json`, `components.json`, `.env.example`, `.gitignore`.

## Schema changes landed

API additions (no migration needed — read-only):

- `enum GlobalSearchEntityType` (10 values)
- `input GlobalSearchInput { query, mode, perTypeLimit, types }`
- `type GlobalSearchResult { ...10 buckets, totalAcrossTypes }`
- `Query.search(input)`

No Prisma schema changes in M0.

## Commits

Branch `main` on `Overton77/humanupgradeapp`:

1. `chore: initialize humanupgradeapp monorepo`
2. `chore: remove repo-exists ack file`
3. `feat(db-types): add @humanupgrade/db-types package`
4. `feat(client): scaffold Next.js 15 client + Clerk + Apollo`
5. `feat(M0): shadcn/ui + ai-elements + workbench shell + Query.search`
6. `feat(M0): all 10 entity detail pages + global search dialog + /search`
7. (this commit) `chore(M0): close milestone — Vercel Analytics, Playwright e2e, delta`

## Actually-shipped surface

- **Routes**: `/`, `/search`, `/workbench` (gated), `/e/{podcasts,episodes,claims,people,organizations,products,compounds,lab-tests,biomarkers,case-studies}/[slug|id]`.
- **API**: `Query.search` resolver tested with `query: "HRV"` → 453 hits across 10 buckets.
- **End-to-end smoke** (verified by curl): `GET /` → 200, `GET /e/episodes/<real-slug>` → 200 with real data, `GET /search?q=HRV` → 200, `GET /search?q=hrv&type=compound` → 200.

## Verified

- [x] `pnpm install` clean (Prisma client regenerated as part of API postinstall).
- [x] `pnpm -F humanupgrade-client typecheck` — 0 errors.
- [x] `pnpm -F humanupgrade-client dev` — boots on :3000.
- [x] Live API on :4000 reachable from the client.
- [x] `Query.search` returns expected counts.

## Post-M0 patch — entity index pages (browse-by-default fix)

Shipped after M0 close to fix a misleading UX: the marketing home + workbench
"Browse <type>" links were sending users to `/search?type=<type>` (which
required typing a query just to load anything). They now go to dedicated
**index pages** that load the full set paginated by default.

### Added

- **10 GraphQL list documents** under `lib/gql/documents/list/list<Entity>.graphql` —
  thin wrappers over the existing per-entity hybrid search resolvers.
- **`lib/entity-index/`**
  - `types.ts` — `BooleanFilterSpec`, `EnumFilterSpec`, `EntityIndexParams`, page-size constants.
  - `params.ts` — `parseEntityIndexParams`, `paramsToApiPagination`, `buildIndexHref`. Pure, no React.
- **`components/entity-index/`**
  - `EntityIndexShell` — page chrome with sticky controls row.
  - `EntityIndexControls` — search input + filter bar + total count.
  - `SearchInTypeInput` — debounced text input that mirrors `?q=`.
  - `FilterBar` — boolean toggles + enum pill rows; URL-driven, no client state.
  - `EntityIndexPagination` — prev/next + page indicator.
  - `EntityIndexCard` + `EntityIndexGrid` + `EntityIndexEmpty` — uniform card layout.
  - `EntityIndexSkeleton` — loading state.
  - `cards/{Episode,Podcast,Compound,Product,CaseStudy,Biomarker,Claim,Person,Organization,LabTest}IndexCard.tsx`
- **10 index routes**:
  `app/e/{podcasts,episodes,claims,people,organizations,products,compounds,lab-tests,biomarkers,case-studies}/page.tsx`
  Each loads paginated by default + supports per-entity text search (`?q=`)
  + supports per-entity filters via the existing API search inputs.
- **Per-route `loading.tsx`** for each new index route.

### Changed

- `app/page.tsx` browse rail → `/e/<type>` (was `/search?type=<type>`).
- `components/workbench/panes/CenterPanePlaceholder.tsx` explorer cards → `/e/<type>`.
- All 10 entity detail pages (`app/e/<type>/[slug-or-id]/page.tsx`) — back-link `backHref`
  rewritten from `/search?type=<type>` to `/e/<type>`.
- `components/search/GlobalSearchResults.tsx` — "see all" links now point at
  `/e/<type>?q=<q>` (per-entity index) instead of `/search?type=<type>` (global search filter).
  Prop renamed: `baseHref` → `query`. Both call sites (`GlobalSearchDialog`, `app/search/page.tsx`) updated.

### Default filters per entity (out of the box)

| Entity | Filters exposed in M0 |
|---|---|
| Episodes | `published` (boolean), `transcript` status (enum: STORED / QUEUED / MISSING / ERROR) |
| Podcasts | `published` (boolean) |
| Products | `active` (boolean) |
| Claims | `stance` (enum), `confidence` (enum) |
| Organizations | `type` (enum: BRAND / MANUFACTURER / LAB / CLINIC / RESEARCH / MEDIA / SPONSOR) |
| Compounds, Biomarkers, Case studies, People, Lab tests | (none yet — text search only) |

The architecture supports any number of filters per entity — see
`lib/entity-index/types.ts`'s `FilterSpec` and the Episodes page for the
reference implementation. M1 (or any future milestone) can broaden filter
coverage with zero infra work.

### Verified

- `pnpm -F humanupgrade-client typecheck` — clean.
- All 11 routes return 200: 10 indexes + `/e/episodes?q=HRV`, `/e/episodes?published=true&page=2`.

## What we punted (small, well-defined follow-ups)

| Deliverable | Reason | Action needed |
|---|---|---|
| **D19 — Sentry** | Requires user to create a Sentry org/project + share DSN. The `@vercel/analytics` + `@vercel/speed-insights` covers basic perf observability. | When ready: `pnpm dlx @sentry/wizard@latest -i nextjs` from inside `humanupgrade-client/`, then commit the generated `sentry.*.config.ts` files. |
| **D4 — API Vercel re-link** | Requires Vercel CLI auth + re-linking the existing `humanupgradeapi` project to the new `Overton77/humanupgradeapp` repo with `rootDirectory: humanupgradeapi`. | One-time UI/CLI action: `vercel link --project humanupgradeapi` from `humanupgradeapi/`. |
| **D5 — Client Vercel project** | Same — requires Vercel UI to create the project pointing at `humanupgrade-client/`. | Create project in Vercel UI: framework Next.js, root `humanupgrade-client`, env vars from the `.env` file. |
| **Playwright browsers** | The test file is written but `playwright install chromium` downloads ~150 MB. | Run `pnpm exec playwright install chromium` once locally; CI will install fresh per run. |
| **Marketing copy polish** | Out of scope for foundation; v1 marketing page is M5. | Defer. |

All five are zero-code follow-ups that need either credentials or one-time CLI actions on your side. None block any subsequent milestone.
