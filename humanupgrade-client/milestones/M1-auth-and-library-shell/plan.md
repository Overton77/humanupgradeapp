# M1 — Auth bridge & Library shell

> **Status:** ⬜ — awaiting plan from the next agent (you).
> **Roadmap target:** ~2 weeks per [docs/10 Milestone 1](../../docs/10-scope-roadmap.md#milestone-1--auth--library-shell-clerk--saves--notes-2-weeks).
> **Schema PRs needed (API):** Schema PR 1 from [docs/08 §10](../../docs/08-data-model-additions.md#10-migration-strategy)
> (User, UserProfile, Folder, SavedEntity, Note, Highlight, UserFile).

## Read these first (in order)

1. **`milestones/INDEX.md`** — confirm M0 closed, M1 next.
2. **`milestones/M0-foundation/plan.md`** + **`delta.md`** — understand what's built and the conventions used.
3. **`milestones/M1-auth-and-library-shell/research.md`** — bootstrap notes I left for you.
4. **`milestones/M1-auth-and-library-shell/references.md`** — citation index (docs + skills + URLs).
5. **`docs/02-feature-spec.md` §A (onboarding) + §C (entity actions) + §D (library)** — the user-visible scope.
6. **`docs/03-information-architecture.md`** — gating rules + route map.
7. **`docs/08-data-model-additions.md` §1–§3 + §10 (PR 1)** — Prisma schema additions you'll be writing.
8. **`docs/09-tech-stack.md` §Auth — Clerk + §Apollo + RSC** — Clerk + Apollo conventions.
9. **`docs/05-ai-assistant.md` §3 (model resolver) + §5 (tools)** — context for how Mode A tools will call your new `saveEntity` mutation in M2.

## Your job

1. Replace this `plan.md` with a full M1 plan using the [`_template/plan.md`](../_template/plan.md) shape. Read the docs above + explore the codebase first; don't shortcut the planning step.
2. Hand the plan back to the user for approval (per the milestones flow — plan vs build are separate sessions).
3. On approval, execute. Track via TODOs and tick deliverables in your `plan.md` as they land.
4. On completion: write `delta.md`, flip `INDEX.md` → ✅ done.

## Scope sketch (NOT a substitute for your full plan — just orientation)

The roadmap's M1 calls for:

| Area | What |
|---|---|
| Auth bridge (was deferred from M0) | **Clerk JWT template + API verification** so the client can make authenticated GraphQL mutations. Needs `@clerk/backend` on the API + a JWT template in the Clerk dashboard + a context plugin on Apollo Server 5 + token-attaching link on the client. |
| Local user sync | **Clerk webhook handler** at `app/api/webhooks/clerk/route.ts` (Svix verification) — upserts `User` + `UserProfile` on `user.created`, updates on `user.updated`, soft-deletes on `user.deleted`. The `User` table needs `clerkId String @unique`. |
| Onboarding wizard | Multi-step `/onboarding` (gated, redirects from `(app)` if `UserProfile.onboardedAt` is null). Fills `primaryGoal`, `secondaryGoals[]`, `healthFlags[]`, basic demographics, time zone, "why now". |
| Library data model | Schema PR 1: `User`, `UserProfile`, `Folder`, `SavedEntity` (poly), `Note`, `Highlight` (poly), `UserFile`, `PaneLayout`. See [doc 08 §2–§4](../../docs/08-data-model-additions.md#2-user--profile). |
| Save / Note / Highlight mutations + queries | New GraphQL surface on the API for the library tables. All gated by `requireUser(ctx)`. |
| Library UI | `/library` route group inside `(app)` with sub-routes for saved / notes / highlights / files / folders. Pane on the workbench's left side replaces `LibraryPanePlaceholder`. |
| Workbench saves wired | The placeholder `EntityActions` Save button on every `/e/<type>/[slug]` page becomes real (calls `saveEntity` mutation, optimistic UI, sonner toast). |
| Notes & highlights | Markdown editor + selection-to-highlight on Episode transcript, Claim, Case study. Highlights are scoped + persisted; notes accept `@`-mentions resolving to entity links. |
| Folders | Nested-1-deep folder organization for saves + notes. |

## Pre-build checklist for you

Before flipping to 🟡 in-progress, get these answers from the user:

- [ ] **Markdown editor pick** — TipTap, Plate, MDXEditor, or a lighter `react-markdown` + textarea? Each affects the highlight-to-note flow design.
- [ ] **Files / uploads scope** — V1 is "user-uploaded case study PDFs + lab PDFs"; do they want to ship file uploads in M1 or push to M3 (where parseLabPdf workflow lands)?
- [ ] **Confirm Clerk JWT template** — they create one in Clerk dashboard (suggested name: `humanupgrade-api`) with claims `{ sub, email, name }`.
- [ ] **API deploy strategy** — local API on `:4000` for the duration of M1, or pin to deployed `humanupgradeapi` on Vercel? (Doc 09's stated default is local-first.)

## Definition of Done (don't change without user approval)

- [ ] Schema PR 1 landed in API + migration applied to dev DB.
- [ ] Authenticated user can sign up via Clerk → land in `/onboarding` → finish wizard → land in `(app)` workbench.
- [ ] Local `User` row mirrors Clerk via webhook (verified by signing up + inspecting Postgres).
- [ ] Save button on every `/e/<type>/[slug]` page works end-to-end (button → GraphQL mutation → DB row → toast → button state flips).
- [ ] `/library/saved` shows the user's saved entities, filterable by type.
- [ ] `/library/notes` lets the user create + edit + delete a note.
- [ ] Selection on an Episode transcript creates a `Highlight` row.
- [ ] Workbench left pane shows the user's library (replacing `LibraryPanePlaceholder`).
- [ ] Playwright e2e: sign-up → save an entity → write a note → highlight a transcript → see all three in `/library`.
- [ ] `delta.md` written; `INDEX.md` flipped to ✅ done; commits pushed.
