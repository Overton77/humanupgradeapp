# 👋 Agent handoff brief

You're picking up a fresh context window with M0 just closed and M1 ahead. This brief is the **fastest path** to being useful.

---

## 1. The 5-minute orientation

This is **HumanUpgrade** — a precision biohacking workbench. Two-codebase pnpm monorepo:

```
humanupgradeapp/                 ← repo root, git origin: github-legacy:Overton77/humanupgradeapp
├── humanupgradeapi/             ← Apollo Server 5 + Express + Prisma 7 GraphQL API
├── humanupgrade-client/         ← Next.js 15 App Router client (you'll mostly work here + the API)
├── packages/
│   └── db-types/                ← shared TS-only types from API's Prisma client
├── pnpm-workspace.yaml
└── package.json                 ← root scripts: dev:api, dev:client, codegen, prisma:migrate
```

**Servers to keep running while you work:**

```bash
pnpm dev:api       # http://localhost:4000/api/graphql  (also Sandbox at /graphql, health at /api/health)
pnpm dev:client    # http://localhost:3000
```

---

## 2. What just shipped (M0, with a post-M0 patch)

- **Monorepo** + fresh git history pushed to `Overton77/humanupgradeapp`.
- **`@humanupgrade/db-types`** — shared types from the API's Prisma client.
- **Next.js 15 + React 19 + Tailwind v4 + shadcn/ui (new-york) + AI Elements** scaffold.
- **Clerk v7** auth (middleware + provider + header buttons + `(app)` gate). **No `User` table or webhook yet — that's M1 work.**
- **Apollo Client v4** RSC + browser providers. Currently sends NO auth headers — **also your job in M1.**
- **GraphQL Codegen** wired against the local API. Source-of-truth `.graphql` files in `lib/gql/documents/`. Generated types in `lib/gql/__generated__/` (gitignored).
- **All 10 public entity detail pages** under `/e/<type>/[slug-or-id]` with reusable components in `components/entity/`.
- **All 10 entity index pages** under `/e/<type>` (paginated by default, per-entity text search, per-entity filters). Built with `components/entity-index/`. Reference impl: `app/e/episodes/page.tsx`.
- **Global search** — `Query.search` resolver on the API + dialog (`⌘K` + Ctrl+K) + `/search` results page.
- **Workbench shell** at `/workbench` (gated) with 3-pane resizable layout + 3 placeholder panes (Library / Center / Assistant) labeled with the milestone that replaces them.
- **Vercel Analytics + Speed Insights** + **Playwright** e2e harness.

Full record: [`M0-foundation/delta.md`](M0-foundation/delta.md). Full plan-as-shipped: [`M0-foundation/plan.md`](M0-foundation/plan.md).

---

## 3. What you're picking up

**M1 — Auth bridge & library shell.** The plan starter and research notes are in [`M1-auth-and-library-shell/`](M1-auth-and-library-shell/).

The user has explicitly asked that planning and building be **separate sessions**:

1. **This session** (or your first session): produce a full `plan.md` based on the docs + the codebase state. Submit to user, await approval.
2. **Next session(s)**: execute the approved plan. Tick deliverables in `plan.md` as you ship.
3. On completion: write `delta.md`, flip status to ✅ done in `INDEX.md`.

Don't shortcut the planning step. The user is going to read it.

---

## 4. The five files that will save you the most time

In **strict** order:

1. [`M1-auth-and-library-shell/plan.md`](M1-auth-and-library-shell/plan.md) — what's expected of you, scope sketch, and the pre-build checklist of questions for the user.
2. [`M1-auth-and-library-shell/research.md`](M1-auth-and-library-shell/research.md) — bootstrapped notes about the codebase (what M0 actually shipped, conventions, things-that-bit-M0).
3. [`M1-auth-and-library-shell/references.md`](M1-auth-and-library-shell/references.md) — citation index; read the docs in the order listed.
4. [`M0-foundation/delta.md`](M0-foundation/delta.md) — concrete inventory of every file M0 added, especially the **post-M0 entity-index patch**.
5. [`../docs/08-data-model-additions.md`](../docs/08-data-model-additions.md) §1–§3 + §10 — the schema you'll be writing in PR 1.

---

## 5. Project rules you must internalize

These come from `humanupgrade-client/index.md`:

1. **Always check the live AI SDK source** in `node_modules/ai/` before writing AI code (you won't write any in M1, but the rule stands).
2. **The AI SDK skill says use Vercel AI Gateway — IGNORE that guidance for THIS project.** We use OpenAI directly + Bedrock for Claude.
3. **Two model providers, called directly.** OpenAI (`OPENAI_API_KEY`, `@ai-sdk/openai`) + Anthropic Claude on Bedrock (`AWS_BEARER_TOKEN_BEDROCK` + `AWS_REGION`, `@ai-sdk/amazon-bedrock`). All resolution goes through `lib/ai/model.ts`.
4. **Quick interactive turns → AI SDK Agent. Long-running, retriable, observable, resumable → Workflow SDK `DurableAgent` + `"use step"` tools.**
5. **Web search = Tavily** (not your problem in M1).
6. **Citations are mandatory** in the assistant (not your problem in M1).
7. **Reasoning, tool calls, sources must be inspectable** via AI Elements (not your problem in M1).
8. **Auth = Clerk v7+.** No NextAuth, no `_app.tsx`, no pages router, no `<SignedIn>` / `<SignedOut>` (use `<Show when="signed-in">`). `clerkMiddleware()` lives in `middleware.ts` (Clerk v7 doesn't sniff `proxy.ts` yet).
9. **Long-term assistant memory = Mem0** (`MEM0_API_KEY`). Lands in M2; not your problem in M1.

---

## 6. Things that bit M0 you should pre-empt

- **Clerk v7's `<UserButton afterSignOutUrl>` prop is gone.** Set on `<ClerkProvider>` instead.
- **GraphQL Codegen enums are PascalCase**: `SearchMode.Hybrid`, `OrganizationType.Brand`, etc. — not the GraphQL UPPER_SNAKE.
- **Apollo v4 `query.data` is `T | undefined`** — always coerce to `null` at the boundary. See `lib/apollo/queries.ts`.
- **The API uses Prisma 7 with the new driver-adapter pattern** (`@prisma/adapter-pg`). The `generated/` output dir is `humanupgradeapi/generated/`.
- **The local-disk legacy git backup** at `humanupgradeapi/.git-legacy-backup/` is gitignored. Don't touch.
- **Both `app/e/<type>/page.tsx` (index) and `app/e/<type>/[slug]/page.tsx` (detail) coexist.** Next handles routing fine, but if you add a new sub-route be aware.

---

## 7. The user's working agreement

- **You** propose plans. **The user** approves. **You** then build.
- **Commit per logical unit** with Conventional Commits + heredoc bodies. Push after each commit (the user has already authorized pushes to `main`).
- **Update todos in real time.** The user's IDE shows them.
- **Don't skip the typecheck step.** `pnpm -F humanupgrade-client typecheck` after every batch of edits.
- **Smoke-test against the live local API.** `curl http://localhost:3000/...`
- **When something blocks**, write down the blocker + the proposed unblock and ask. Don't silently work around it.

---

## 8. First message you should send the user (suggested)

> *"I've read the M1 handoff brief, plan starter, research notes, and the docs (01–10 + 08 §1–§3 carefully). Before I draft the full M1 plan, I need answers to the four pre-build questions in `plan.md`:*
>
> 1. *Markdown editor pick (TipTap / Plate / MDXEditor / lighter)?*
> 2. *Files / uploads in M1, or push to M3?*
> 3. *Confirm Clerk JWT template name (`humanupgrade-api`) — and confirm you've created it in the Clerk dashboard with claims `{ sub, email, name }`.*
> 4. *Local API on `:4000` for the duration, or pin to deployed `humanupgradeapi`?*
>
> *Once you answer those I'll produce the full plan."*

Good luck. Build something good.
