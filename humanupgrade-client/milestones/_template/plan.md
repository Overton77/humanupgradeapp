# M? — <Name>

> **Status:** planning · **Roadmap target:** <duration from docs/10>
> **Schema PRs needed (API):** —  ·  **Client PRs:** —

## Goal

One sentence. What "done" looks like in user-visible terms.

## Scope

**In:**
- …

**Out (defer):**
- …

## Deliverables

- [ ] D1 — …
- [ ] D2 — …
- [ ] D3 — …

## API work — `humanupgradeapi`

1. **Prisma schema changes** (`prisma/schema.prisma`)
   - …
2. **Migration** — `pnpm prisma migrate dev --name <feature>`
3. **Zod validators** (`src/validation/<entity>.ts`)
   - …
4. **GraphQL** (`src/graphql/resolvers/<entity>.ts`)
   - Types, queries, mutations
   - DataLoader if N+1 risk
5. **Tests** — resolver tests with the dev DB
6. **Deploy** — preview deploy on Vercel, smoke test

## Client work — `humanupgrade-client`

1. **Routes / pages** — …
2. **Components** — …
3. **AI tools / agents / workflows** — …
4. **Codegen** — `pnpm codegen` after API changes land
5. **Tests** — Vitest unit + Playwright e2e for the headline flow
6. **Deploy** — preview deploy, demo recording

## Risks & open questions

- …

## Definition of Done

- [ ] All deliverables checked
- [ ] API deployed (dev / preview)
- [ ] Client preview deploy green
- [ ] E2E test for the headline flow added
- [ ] `delta.md` written
- [ ] `INDEX.md` updated to ✅ done
