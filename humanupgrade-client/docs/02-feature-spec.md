# 02 — Feature Specification

Prioritization is **MoSCoW**: *Must / Should / Could / Won't (this release)*.
"v1" = first public Vercel deploy. "v1.1" = follow-up sprint. "v2" = post-validation.

---

## A. Identity & Onboarding

| ID | Feature | Priority |
|---|---|---|
| A1 | **Clerk** auth — email, Google, and any other Clerk-enabled provider; Clerk-hosted `<UserButton>` for account management; webhook syncs to local `User` row | Must (v1) |
| A2 | Multi-step onboarding wizard (5–7 screens) capturing: demographics, primary goals, sleep baseline, training history, current supplements, biomarkers of interest | Must (v1) |
| A3 | Goal weighting — user picks 1 *primary* and up to 3 *secondary* goals from a curated list (Sleep, Energy, Cognition, Longevity, Metabolic Health, Strength, VO2 Max, Stress, Body Comp, Hormonal) | Must (v1) |
| A4 | Health context flags — vegetarian/vegan, pregnant, on medication, post-menopausal, etc. (used as constraints by the assistant) | Should (v1) |
| A5 | Re-runnable onboarding — user can reopen any section in Settings → Profile | Should (v1) |
| A6 | Connect wearables (Apple Health, Oura, Whoop, Dexcom) via OAuth | Could (v1.1) |

**Output of onboarding:** a `UserProfile` row + the first 3 quests on the dashboard.

---

## B. Search & Discovery

| ID | Feature | Priority |
|---|---|---|
| B1 | Global search bar in the header — `⌘K` opens it. Hybrid (lexical + semantic) over all 10 entity types | Must (v1) |
| B2 | Per-entity search pages with filters — e.g. `/products?organizationType=BRAND&category=...&isActive=true` | Must (v1) |
| B3 | Search results grouped by entity type with counts: *"23 Compounds, 11 Products, 4 Episodes…"* | Must (v1) |
| B4 | Result cards show 2 hops of relations inline (e.g. a Product card shows top 3 contained Compounds) | Should (v1) |
| B5 | "Trending" and "Recommended for you" sections on the homepage, recomputed server-side | Should (v1) |
| B6 | Saved searches that re-run and notify | Could (v1.1) |
| B7 | Compare mode — pick 2–4 entities of the same type, see side-by-side | Could (v2) |

---

## C. Entity Browsing & Relations

For every entity type the user gets a detail page with three regions:

1. **Header** — title, type badge, key metadata, save button, share button, "Ask Assistant about this" button.
2. **Body** — full description / transcript / claims / etc.
3. **Relations rail** — typed relation chips. Clicking any chip filters the rail (e.g. "Show only HIGH-confidence claims").

| ID | Feature | Priority |
|---|---|---|
| C1 | Detail pages for all 10 entity types | Must (v1) |
| C2 | Relation rail rendering inverse relations (e.g. on a Compound, show *"Found in 23 Products"*) | Must (v1) |
| C3 | Relation graph mini-view (force-directed, 1 hop, max ~30 nodes) — collapsible | Should (v1) |
| C4 | "Open in workbench" — sends the entity to the workbench's left pane | Must (v1) |
| C5 | Episode page features inline transcript with claim anchors and a YouTube embed if available | Must (v1) |
| C6 | Case Study page with PDF/link preview (`react-pdf` or iframe), highlightable | Must (v1) |
| C7 | Highlights — user selects text in transcript, claim, case study or note, presses `H` or right-clicks → action menu (Save highlight, Ask assistant, Add to note, Add to protocol) | Must (v1) |

---

## D. Personal Library (Saves & Notes)

| ID | Feature | Priority |
|---|---|---|
| D1 | Save any entity to library with optional tag(s) and folder | Must (v1) |
| D2 | Library page with filters by entity type, tag, folder, and full-text search | Must (v1) |
| D3 | Notes — markdown-first, support `@`-mentions of entities (auto-resolves to a citation chip) | Must (v1) |
| D4 | Highlights — saved selections from any source, attached to the source entity, browsable in library | Must (v1) |
| D5 | Drag a saved item / note / highlight into the assistant pane → it becomes context for the next turn | Must (v1) |
| D6 | Folders / collections, nested 1 deep | Should (v1) |
| D7 | User-uploaded files: case study PDFs, lab PDFs, notes (.md, .txt) — stored in S3, parsed for text | Should (v1) |
| D8 | Note templates ("Daily review", "Post-training", "Lab interpretation") | Could (v1.1) |
| D9 | Public sharing of a note/protocol via signed URL | Could (v2) |

---

## E. Protocols

A **Protocol** is the user's executable plan. It is composed of **Protocol Steps**, each tied to one of the 7 time layers.

| ID | Feature | Priority |
|---|---|---|
| E1 | Create / edit / delete protocols | Must (v1) |
| E2 | A protocol has: title, goal(s) it serves, status (draft/active/paused/archived), start date, optional end date, visibility (private only in v1) | Must (v1) |
| E3 | Steps with: title, description, time layer (CONTINUOUS … ANNUAL), cadence (cron-ish), linked entities (compounds, products, biomarkers), expected outcome, optional metric to log | Must (v1) |
| E4 | "Build a protocol with the Assistant" — opens the assistant pre-loaded with context for protocol creation; the assistant uses tool calls to add steps | Must (v1) |
| E5 | "Build a protocol from a Note / Highlight / Episode / Case Study" — right-click → *Generate protocol* | Must (v1) |
| E6 | Active protocol dashboard — today's steps grouped by time of day | Must (v1) |
| E7 | Step check-ins: ✅ Did it · 📎 Attach proof (photo / file) · 🔗 Sync from device data | Must (v1) |
| E8 | Protocol templates the user can clone (we ship ~10 starter templates) | Should (v1) |
| E9 | Protocol versioning / diff (each meaningful edit creates a revision) | Could (v1.1) |

---

## F. Biomarker Tracking

| ID | Feature | Priority |
|---|---|---|
| F1 | Pick from the curated `Biomarker` set to track | Must (v1) |
| F2 | Create custom biomarkers (name, unit, optional reference range) — stored as `UserBiomarker` | Must (v1) |
| F3 | Add a reading manually (value, unit, takenAt, source, optional note) | Must (v1) |
| F4 | Bulk import readings from a CSV or a parsed lab PDF | Should (v1) |
| F5 | Per-biomarker chart with trend, reference band, and protocol-step overlay (shaded windows when the user was running a relevant step) | Must (v1) |
| F6 | "Recompute insights" — server job that finds correlations between protocol adherence and biomarker movement | Should (v1.1) |
| F7 | Wearable / CGM auto-sync | Could (v1.1) |

---

## G. AI Assistant

Detailed architecture in [05 — AI Assistant](./05-ai-assistant.md), [11 — Workflows & Durable Agents](./11-workflows-and-durable-agents.md), and [12 — AI Elements UI Mapping](./12-ai-elements-mapping.md).

### G.1 — Surfaces and core conversation

| ID | Feature | Priority |
|---|---|---|
| G1 | Floating assistant: side pane (`⌘J`), full-screen view (`/assistant`), and `⌘K` quick-ask palette | Must (v1) |
| G2 | Streaming responses via **Vercel AI SDK v6+** (`Agent` / `ToolLoopAgent` + `useChat`) with **OpenAI** (`@ai-sdk/openai`) and **Anthropic Claude on Amazon Bedrock** (`@ai-sdk/amazon-bedrock`) as model providers — no gateway | Must (v1) |
| G3 | Auto-attached context: user profile, currently focused entity, selected highlight, active protocol | Must (v1) |
| G4 | Manually attached context: drag any saved entity / note / file into the composer (drop target on `PromptInput`) | Must (v1) |
| G5 | Per-thread persistence (`AssistantThread`, `AssistantMessage`); switch surface, never lose turns | Must (v1) |
| G6 | Per-thread model selector (`PromptInputModelSelect`) — switches between `'balanced'` (OpenAI GPT-5) and `'reasoning-heavy'` (Claude Sonnet 4.5 on Bedrock) tiers via `getModel()` | Should (v1) |

### G.2 — Inspectable AI UX (parity with OpenAI / Anthropic / Perplexity)

| ID | Feature | Priority |
|---|---|---|
| G7 | **Reasoning trace** rendered with `Reasoning` (single-block) or `ChainOfThought` (labeled steps) — auto-collapse on finish | Must (v1) |
| G8 | **Tool-call cards** (`Tool` + custom per-tool cards) — show input, output, status badge, errors, duration | Must (v1) |
| G9 | **Sources block** (`Sources` / `Source`) — automatic from `source-url` parts; web sources from Tavily, etc. | Must (v1) |
| G10 | **Inline citations** in assistant prose (`InlineCitation`) — chips link to the source entity / URL | Must (v1) |
| G11 | **Generated artifacts** (`Artifact`) — protocols, analysis reports, lab extractions; with Save / Open / Edit actions | Must (v1) |
| G12 | **Confirmation flow** (`Confirmation`) for any write the assistant proposes (no silent mutations) | Must (v1) |
| G13 | **Progress streams** for long tools (`Task` + `data-*` parts) — live phase / count / per-result updates | Must (v1) |
| G14 | **Suggestions strip** (`Suggestion`) — context-derived CTAs above the composer; cached server-side | Should (v1) |
| G15 | **Open in chat** affordance — `⌘K` quick-ask result can be promoted into a durable side-pane thread | Should (v1) |

### G.3 — Tools the assistant can call

**Interactive (fast, in-process, AI SDK):**

| ID | Feature | Priority |
|---|---|---|
| G16 | `searchEntities` (hybrid search across all 10 entity types) | Must (v1) |
| G17 | `getEntity` (single entity + 1-hop relations) | Must (v1) |
| G18 | `saveEntity`, `createNote`, `appendToNote`, `createHighlight` | Must (v1) |
| G19 | `pickBiomarkerToTrack`, `logBiomarkerReading` | Must (v1) |
| G20 | `proposeProtocol`, `addProtocolStep` (with HITL `Confirmation`) | Must (v1) |
| G21 | `awardXp` (server-allowlisted reasons only) | Must (v1) |
| G22 | `summarizeForMemory` (thread or profile scope) | Should (v1) |

**Durable (long-running, resumable, retried — Workflow SDK):**

| ID | Feature | Priority |
|---|---|---|
| G23 | `webResearch(query)` — Tavily search; returns sources + summary; streams sources live | Must (v1) |
| G24 | `verifyClaim(claimRef)` — internal evidence + web evidence → SUPPORTS / OPPOSES / MIXED with citations | Must (v1) |
| G25 | `deepCaseStudyAnalysis(caseStudyId, focus)` — multi-step analysis with progress + final `Artifact` report | Must (v1) |
| G26 | `parseLabPdf(fileId)` — OCR + extract biomarker readings, each row goes through HITL `Confirmation` | Should (v1) |
| G27 | `protocolGenerationWorkflow` (long-form, multi-week protocol design with HITL approval) | Should (v1) |

### G.4 — Durability & resumability

| ID | Feature | Priority |
|---|---|---|
| G28 | **Durable agent** for side pane / full-screen surfaces (`DurableAgent` inside a `"use workflow"`) | Must (v1) |
| G29 | **Resumable streams** via `WorkflowChatTransport` — refresh / network blip / function timeout all reconnect transparently | Must (v1) |
| G30 | **Workflow observability** dashboard — every run, every step, every retry visible in Vercel | Must (v1) |
| G31 | **Per-step automatic retries** for all `"use step"` tools (3× by default; `RetryableError` for rate-limited APIs) | Must (v1) |
| G32 | **Multi-turn workflow** mode (workflow owns history, follow-ups via `chatMessageHook`) | Could (v1.1) |
| G33 | **Multi-player chat** — system events / external webhooks inject into a live thread via hooks | Could (v2) |

### G.5 — Memory & safety

| ID | Feature | Priority |
|---|---|---|
| G34 | Per-conversation memory — summarized into `AssistantThread.memory` every 8 turns / 4k tokens | Should (v1) |
| G35 | Long-term user memory via **Mem0** (`mem0ai`) — atomic facts extracted automatically, scoped per user, queried into the system addendum on every turn; Settings → Memory exposes pin / edit / delete | Must (v1) |
| G36 | Per-user **rate limit + token budget** (Upstash Redis); graceful degradation when exhausted | Must (v1) |
| G37 | Educational-not-medical guardrails in the system prompt + post-generation rules layer | Must (v1) |
| G38 | Prompt-injection guard on attached files (parsed text wrapped in fenced delimiters with explicit framing) | Must (v1) |
| G39 | Voice in / voice out (`SpeechInput` element + provider) | Could (v1.1) |

---

## H. Workbench Layout

| ID | Feature | Priority |
|---|---|---|
| H1 | Three-pane resizable layout: Left = entities/library, Center = focused entity / note / protocol, Right = assistant | Must (v1) |
| H2 | Each pane: drag to resize, double-click handle to collapse, button to maximize, persisted per user | Must (v1) |
| H3 | Tabs inside the center pane (multiple open entities/notes/protocols) | Must (v1) |
| H4 | Drag-and-drop between panes (entity → assistant, highlight → note, note → protocol) | Must (v1) |
| H5 | Command palette (`⌘K`) | Must (v1) |
| H6 | Keyboard shortcuts overlay (`?`) | Should (v1) |
| H7 | Light / dark theme | Should (v1) |

---

## I. Recommendations & Trending

| ID | Feature | Priority |
|---|---|---|
| I1 | Server recompute jobs after meaningful mutations (save, protocol create, reading logged, profile change) — debounced per user | Must (v1) |
| I2 | "Recommended for you" homepage rail (entities scored against profile + activity) | Must (v1) |
| I3 | Global "Trending" rail (entities with recent activity weighted by graph centrality) | Must (v1) |
| I4 | Per-entity "People also explored" rail | Should (v1) |
| I5 | Daily digest email (opt-in) | Could (v1.1) |

---

## J. Gamification — "Becoming an Advanced Biohacker"

See [07 — Gamification & Journey](./07-gamification-journey.md) for the full design.

| ID | Feature | Priority |
|---|---|---|
| J1 | Levels 1–10 with named tiers (Curious → Practitioner → Operator → Architect) | Must (v1) |
| J2 | XP awarded for: completing onboarding step, saving entity, building protocol, completing protocol step, syncing reading, uploading proof | Must (v1) |
| J3 | Quests — server-issued multi-step missions ("Map your circadian week") | Must (v1) |
| J4 | Streaks per protocol & overall | Should (v1) |
| J5 | Badges (visible only to the user in v1) | Should (v1) |
| J6 | Leaderboards / sharing | Won't (v1) |

---

## K. Settings, Privacy, Account

| ID | Feature | Priority |
|---|---|---|
| K1 | Profile edit, goal edit, health flags edit | Must (v1) |
| K2 | Export all my data (JSON) | Must (v1) |
| K3 | Delete account (cascading) | Must (v1) |
| K4 | Notification prefs | Should (v1) |
| K5 | Subscription / billing (Stripe) | Could (v1.1) |
