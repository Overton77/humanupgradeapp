# M0 — Research notes

## What I read

- [`docs/01-vision.md`](../../docs/01-vision.md) — confirmed the workbench-not-feed positioning, so M0 ships the workbench shell even though it's mostly empty.
- [`docs/03-information-architecture.md`](../../docs/03-information-architecture.md) — confirmed the `/e/...` namespace is public (anyone can deep-link), gating starts at `(app)/...`.
- [`docs/04-layouts-wireframes.md`](../../docs/04-layouts-wireframes.md) §2 — Episode page is the most complex of the 10 entity layouts; it becomes the reference impl for M0, others get the lighter version.
- [`docs/09-tech-stack.md`](../../docs/09-tech-stack.md) — locked stack choices, env var list, repo layout target.
- [`docs/10-scope-roadmap.md`](../../docs/10-scope-roadmap.md) Milestone 0 — original ~1-week M0; expanded slightly here to absorb the monorepo conversion that the roadmap implicitly assumed.
- [`humanupgradeapi/package.json`](../../../humanupgradeapi/package.json) — Prisma 7 + driver-adapter, Express on Apollo Server 5, Node 24.
- [`humanupgradeapi/.vercel/project.json`](../../../humanupgradeapi/.vercel/project.json) — existing project id, framework `express`, no `rootDirectory` set.
- [`humanupgradeapi/prisma/schema.prisma`](../../../humanupgradeapi/prisma/schema.prisma) — the current 10 entity types; the `generated/` output dir is what `db-types` will re-export.
- [`humanupgradeapi/src/search/entitySearchTypes.ts`](../../../humanupgradeapi/src/search/entitySearchTypes.ts) — confirmed there are 10 typed per-entity search inputs already, plus a `SearchMode` enum (NONE / LEXICAL / SEMANTIC / HYBRID). No multi-entity union resolver visible — likely needs adding.
- [`.agents/skills/ai-elements/SKILL.md`](../../.agents/skills/ai-elements/SKILL.md) — install via `pnpm dlx ai-elements@latest`, components land in `components/ai-elements/`. Defers to shadcn config if present.

## Key findings

1. **Existing API repo has its own git history** at `humanupgradeapi/.git` (`Overton77/humanupgradebiotechapi`). The workspace root has no git. The client folder has no git. → Cleanest path is a fresh monorepo git repo, with the legacy API repo archived. **Drove R1.**
2. **Prisma 7 driver-adapter pattern** changes how the generated client looks. The output dir from `prisma.config.ts` is `humanupgradeapi/generated/`. → `db-types` re-exports types from there; runtime client never crosses the package boundary.
3. **No multi-entity search resolver in the API yet** — the existing search service exposes per-entity hybrid search but I didn't find a unified `Query.search` field. → Either we add one in M0 (preferred) or we fan out N parallel queries from the client. **Drove R3.**
4. **Apollo Server 5 + Express + Node 24** — `@as-integrations/express5` is in use. CORS comes through Express middleware; need to confirm `*.vercel.app` is allowed before the client preview deploys can call it.
5. **`@ai-sdk/react` `useChat` v6** patterns require very specific import shapes — but M0 has no AI code, so this is a future-proofing note: install AI Elements now so M2 doesn't fight config drift.
6. **Vercel multi-project from one repo** is well-supported via per-project `rootDirectory`. No special config needed beyond setting it once on each project.
7. **Clerk + Workflow SDK matcher overlap** — both want `proxy.ts` matchers. The combined regex in [docs/09 §Auth — Clerk](../../docs/09-tech-stack.md#auth--clerk) handles both; we ship that even though Workflow SDK isn't wired until M2.5.
8. **Clerk publishable + secret keys are blockers** for any sign-in flow. We need them before D10 can be tested locally.

## Discarded options

- **Two separate git repos with `db-types` published to npm.** Heavyweight: requires a publish pipeline, version pinning, no atomic schema-changes-with-resolvers commits. The user explicitly green-lit reconfiguration, so monorepo wins.
- **`git subtree` import of the legacy API history into the new monorepo.** Possible but adds risk, and history can be re-discovered by archiving the old repo with a pointer. Recommending fresh-start initial commit instead.
- **Skip AI Elements install in M0.** Adds zero runtime cost but locks shadcn config to the right shape early. Keep it.
- **Use `middleware.ts` as in the AI SDK skill examples.** Next.js 15+ renamed it to `proxy.ts`. The Clerk + Workflow SDK docs both accept the new name; we use it.
- **Build `db-types` as a generated package on every install.** Marginal value over `tsconfig.json` path mapping; revisit if path mapping causes friction.

## New questions surfaced

- **Q1:** Should the monorepo use Turborepo, or is plain pnpm workspace enough for M0? *Recommendation: plain pnpm workspace; introduce Turborepo if/when CI starts to drag.*
- **Q2:** Does the API need a small `/health` endpoint added in M0? *Recommendation: yes, trivial; useful for Vercel + Sentry.*
- **Q3:** Vercel Sentry integration vs manual `@sentry/nextjs` install? *Either works; manual install gives more config control. Picking manual.*
- **Q4:** Do we ship a marketing landing page now, or a placeholder? *M0 ships a placeholder with copy, sign-up CTA, and a screenshot of the workbench. Real marketing page in M5.*
