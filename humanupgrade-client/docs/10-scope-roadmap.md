# 10 — Scope & Roadmap

The aim is **one shippable milestone every ~2 weeks**, each ending in a Vercel deploy that real users can touch. We do not build private branches for months.

Below: 5 milestones to v1, then a v1.1 follow-up sprint.

---

## Milestone 0 — Foundation (1 week)

**Goal:** the client compiles, deploys to Vercel, can read public entities from the live API.

- [ ] Bootstrap Next.js 15 + Tailwind v4 + shadcn/ui in `humanupgrade-client/`.
- [ ] Wrap `next.config.ts` with `withWorkflow()`, add `tsconfig.json` workflow plugin (free for later).
- [ ] Install AI Elements via `pnpm dlx ai-elements@latest` (sets up shadcn config).
- [ ] Apollo Client + GraphQL Codegen wired to the deployed API.
- [ ] Public entity pages for **all 10 types** (`/e/...`), read-only, basic layout.
- [ ] Global search bar (B1) — hybrid search via existing API.
- [ ] Vercel preview deploys per PR.
- [ ] Sentry + Vercel Analytics enabled.

**Demo:** anyone can land on the marketing page, search "HRV", click into an episode, see its claims, sponsors, transcript.

---

## Milestone 1 — Auth, profile, library shell (2 weeks)

**Schema PR 1** ships in API.

- [ ] **Clerk** auth: install `@clerk/nextjs`, add `proxy.ts` with `clerkMiddleware()` (combine with Workflow SDK exclusion), wrap `app/layout.tsx` body in `<ClerkProvider>`, header `<Show when="signed-in">`/`<Show when="signed-out">` with `<UserButton>` / `<SignInButton>` / `<SignUpButton>`. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY`.
- [ ] Local `User` table (with `clerkId` unique); `app/api/webhooks/clerk/route.ts` to upsert on `user.created` / `user.updated` / `user.deleted` (Svix signature verification).
- [ ] `lib/auth/index.ts` helpers: `requireUser()`, `requireUserId()`, `getUserOrNull()`.
- [ ] Onboarding wizard (A2, A3, A4) → `UserProfile`.
- [ ] Workbench shell: 3 resizable panes, command palette stub (`⌘K`), keyboard shortcuts overlay.
- [ ] `Folder` + `SavedEntity` + Save button on every entity card.
- [ ] `Note` model + a basic markdown editor (no `@`-mentions yet).
- [ ] `Highlight` from episode transcripts.
- [ ] `/library` index with filter by type/tag.
- [ ] Profile page with edit (re-runnable onboarding A5).

**Demo:** sign up, complete onboarding, save 3 entities, write a note, highlight a transcript line, see them all in `/library`.

---

## Milestone 2 — Assistant v0 (interactive) (2 weeks)

**Schema PR 3** ships in API. AI tools for **read** + **save** + **note** only. Interactive Mode A (no workflow yet).

- [ ] Install AI Elements: `conversation message prompt-input reasoning tool sources inline-citation suggestion attachments` (G1, G7–G10, G14).
- [ ] `lib/agents/humanupgrade-agent.ts` with `ToolLoopAgent` + `InferAgentUIMessage` exported.
- [ ] `lib/ai/model.ts` with `getModel(tier)` — wires OpenAI (`OPENAI_API_KEY`) and Bedrock (`AWS_BEARER_TOKEN_BEDROCK` + `AWS_REGION`) providers. Verify `aws bedrock list-foundation-models` returns the chosen Claude Sonnet model in the chosen region.
- [ ] Route handler: `app/api/assistant/chat/route.ts` using `agent.stream()` + `toUIMessageStream()`.
- [ ] Side pane `AssistantPane.tsx` using `useChat<HumanUpgradeUIMessage>` (manual `input`).
- [ ] `AssistantThread` + `AssistantMessage` persistence (write on `onChatEnd`).
- [ ] Tools: `searchEntities`, `getEntity`, `listSavedEntities`, `saveEntity`, `createNote`, `appendToNote`, `createHighlight` (G16–G18).
- [ ] Custom tool cards for `searchEntities` and `getEntity`; generic `Tool` element for the rest.
- [ ] Auto-attached context envelope (`buildContextEnvelope`) — route + focused entity + profile summary.
- [ ] Manual attachment via `PromptInput` + drag-and-drop drop target.
- [ ] Inline citations (post-process text parts → `InlineCitation` chips).
- [ ] `⌘K` quick-ask modal (single-turn, smaller model) with `OpenInChat`.
- [ ] Per-thread memory summarization (summarized after 8 turns into `AssistantThread.memory`).
- [ ] **Mem0** wrapper in `lib/memory/mem0.ts` (`MEM0_API_KEY`); `searchMemory` called inside `buildContextEnvelope`; `addMemory` step fired after every assistant turn.
- [ ] Settings → Memory page: list / pin / edit / delete Mem0 facts.
- [ ] Rate limit + token-budget middleware per user; cost logged into `AssistantMessage`.

**Demo:** "Find me 3 sleep papers Huberman has cited and save the most relevant to a `Sleep` folder, with a note summarizing why." → user sees `Reasoning` collapse, `Tool` cards for each search, an `Artifact`-style note draft.

---

## Milestone 2.5 — Durable assistant (1 week)

**Goal:** the side pane survives page refresh, network drops, and 60-second tool calls. Sets up the substrate for Milestone 3's long-running tools.

- [ ] Workflow SDK installed (`workflow`, `@workflow/ai`); `next.config.ts` wrapped.
- [ ] `workflows/chat/workflow.ts` — `chatWorkflow(messages)` using `DurableAgent`.
- [ ] Convert `app/api/assistant/chat/route.ts` to `start(chatWorkflow, ...)`; return `x-workflow-run-id`.
- [ ] Add `app/api/assistant/chat/[runId]/stream/route.ts` reconnection endpoint.
- [ ] Switch the side pane's `useChat` to `WorkflowChatTransport` (G29) with `initialStartIndex: -50`.
- [ ] Mark all current tools as `"use step"` for free retries + observability.
- [ ] Wire `npx workflow web` for local debugging; verify Vercel dashboard in production.

**Demo:** Open chat, send a message that triggers 3 tool calls, refresh mid-stream → conversation resumes from the last chunk.

---

## Milestone 3 — Protocols, biomarkers + long-running AI tools (3 weeks)

**Schema PR 2** ships in API.

### 3a — Protocols & biomarkers (UI + interactive tools)

- [ ] Protocol CRUD (`/protocols`, `/protocols/new`, `/protocols/[id]`).
- [ ] Step builder UI with the 7-layer picker + structured cadence editor.
- [ ] Linking steps to public Compounds / Products / Biomarkers / Episodes / Case Studies.
- [ ] **Today view** (`/protocols/today`) grouped by time-of-day.
- [ ] Step check-ins (✅, 📎 photo / file, 🔗 sync placeholder).
- [ ] `UserBiomarker` + `BiomarkerReading` CRUD, manual entry + CSV import.
- [ ] `/track` index + per-biomarker chart with reference band + protocol overlay (Recharts).
- [ ] Assistant tools: `createProtocol`, `addProtocolStep`, `proposeProtocol`, `pickBiomarkerToTrack`, `logBiomarkerReading` (G19–G21).
- [ ] **`Confirmation`** flow on `proposeProtocol` (ai-elements) — never auto-save.
- [ ] **`Artifact`** card for protocol drafts with Save / Open / Edit actions.

### 3b — Long-running AI tools (Workflow SDK)

- [ ] Install `ai-elements` `confirmation artifact task chain-of-thought`.
- [ ] `workflows/analysis/parse-lab-pdf.ts` + `lib/tools/parse-lab-pdf.ts` (G26).
  - HITL `Confirmation` per extracted reading row before persisting.
- [ ] `workflows/analysis/web-research.ts` + tool `webResearch` (G23) — Tavily; streams `data-tavily-result` per source → `Sources` block.
- [ ] `workflows/analysis/verify-claim.ts` + tool `verifyClaim` (G24) — internal evidence + Tavily + classify; renders `ChainOfThought` + verdict + `Sources`.
- [ ] `workflows/analysis/deep-case-study.ts` + tool `deepCaseStudyAnalysis` (G25) — `Task` while running → `Artifact` when done.
- [ ] Recompute workflows replacing `waitUntil`: `recomputeAdherence`, `recomputeBiomarkerInsights`, `recomputeRecommendations` (debounced).
- [ ] Vercel Cron for `recomputeTrending` (hourly) and `weeklyDigest` (Sunday).
- [ ] `useAssistantStreamData(type, id)` hook for `data-*` parts.
- [ ] Custom tool cards: `LabReadingsApprovalCard`, `WebResearchCard`, `ClaimVerificationCard`, `DeepCaseStudyAnalysisCard`.

**Demo 1:** "Build me a wind-down protocol from this episode" → assistant proposes 4 steps → `Confirmation` card → user accepts → `Artifact` with link to `/protocols/[id]`.

**Demo 2:** Right-click any Claim → "Verify this" → side pane streams `ChainOfThought` (search internal → search web → classify) → final verdict card with 6 cited sources, refreshable across page reloads.

**Demo 3:** Upload a lab PDF → `parseLabPdf` workflow streams `data-lab-extraction` chunks → user sees a list of `Confirmation` cards, accepts/edits each → readings persist and chart updates.

---

## Milestone 4 — Workbench polish + journey (2 weeks)

**Schema PR 4 + PR 5** ship in API.

- [ ] Real drag-and-drop everywhere (D5, H4) with `@dnd-kit`.
- [ ] `@`-mentions in notes (with hover card + entity resolution → `Note.mentionedEntities`).
- [ ] `PaneLayout` persistence per route.
- [ ] Tabs in the center pane (multiple open entities/notes/protocols simultaneously).
- [ ] Recommendations rail + Trending rail on home, fed by recompute caches.
- [ ] **Journey** page: levels (J1), XP events, starter quests (J2, J3), badges (J5).
- [ ] `XpEvent` writes from every relevant action, with caps enforced server-side.
- [ ] Streaks (J4) per protocol + engagement.
- [ ] Suggestions strip in the assistant pane (`route + focus → 2–4 CTAs`).
- [ ] Onboarding generates the first 3 quests automatically.

**Demo:** finish onboarding → see 3 active quests → complete them → hit Lvl 2 → assistant fires a contextual congrats and proposes the next quest.

---

## Milestone 5 — Hardening (1 week) → v1 launch

- [ ] Empty/error/loading states across every screen.
- [ ] Mobile bottom-tab fallback for the 3-pane layout.
- [ ] Light/dark theme.
- [ ] Settings → Memory editor (Mem0-backed; pin / edit / delete + search).
- [ ] Settings → Data export (JSON download) + Account delete (cascade).
- [ ] Accessibility pass (Radix + manual keyboard testing).
- [ ] Playwright e2e for: onboarding, save, build protocol, log reading, ask assistant.
- [ ] Marketing landing page + privacy + terms.
- [ ] Production-grade rate limiting + cost dashboards on the AI route.

**v1 ship.** Public Vercel deploy, signups open with an invite gate.

---

## v1.1 — Two-week follow-up sprint

Highest-leverage items deferred from v1:

- Wearable integrations (Oura, Whoop, Apple Health) via OAuth + reading sync (F7).
- Saved searches with notify (B6).
- Note templates (D8).
- Voice in / voice out for assistant (G39) — `SpeechInput` + `Transcription` ai-elements.
- Daily / weekly digest email (I5).
- Protocol versioning (E9).
- **Multi-turn workflow chat** (G32) — workflow owns conversation history, follow-ups via `chatMessageHook`. Enables agentic sessions that span days.
- **Per-thread model selector** with budget-aware defaults; cost dashboards per model.

---

## v2 — themes, not features

- **Social, carefully.** Public protocol sharing (D9), Compare mode (B7), invitations.
- **Multi-player chat (G33).** A clinician and a client share an assistant thread; system events (lab results in, wearable anomalies) inject into the conversation via workflow hooks.
- **Clinical depth.** Provider mode, lab provider integrations, validated questionnaires.
- **Wider integration surface.** Garmin, Eight Sleep, CGM auto-stream.
- **Marketplace, maybe.** Affiliate links on Products with disclosure.

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| AI cost runaway | Per-user token budgets in Upstash; cheaper model for `⌘K` quick-asks; aggressive thread summarization; per-thread model selector with budget-aware defaults. |
| Schema churn breaking the API | All client-required schema lands in 5 sequential, additive PRs. No public type changes. |
| Hallucinated medical advice | Hard system-prompt + post-generation rules layer + every write tool requires `Confirmation`. |
| AI SDK / Workflow SDK churn | Skills in `.agents/skills/` are the canonical source; always check `node_modules/ai/docs/` and `workflow-sdk.dev` before writing AI code. Pin versions in `package.json`; upgrade in dedicated PRs. |
| Long-running tools timeout on Vercel | All > 30 s tools are workflows with resumable streams (`WorkflowChatTransport`) — function timeouts no longer break UX. |
| Pane / DnD complexity | `@dnd-kit` + `react-resizable-panels` are battle-tested; defer custom multi-window in v1. |
| Wearable scope creep | Explicitly out of v1; v1 ships with manual + CSV + lab PDF only. |

---

## Definition of Done (per milestone)

A milestone is "done" only when:

1. Deployed to Vercel production.
2. Walkthrough demo recorded.
3. Zero P0/P1 bugs in the affected surfaces.
4. e2e test added for the headline user flow.
5. Docs in `humanupgrade-client/docs/` updated to reflect what actually shipped (deltas tracked at the bottom of each doc).
