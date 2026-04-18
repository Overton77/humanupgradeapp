# 03 — Information Architecture

## Top-level navigation

```
┌──────────────────────────────────────────────────────────────────────┐
│ HumanUpgrade   [⌘K Search…]            🏠 Home  📚 Library  🧪 Track │
│                                         🧭 Protocols  🎯 Journey   👤│
└──────────────────────────────────────────────────────────────────────┘
```

| Item | Route | Purpose |
|---|---|---|
| Home | `/` | Workbench. Default landing for signed-in users. Recs + Trending + Continue where you left off. |
| Library | `/library` | All saved entities, notes, highlights, files. |
| Track | `/track` | Biomarkers + readings + charts. |
| Protocols | `/protocols` | All user protocols + "today" view. |
| Journey | `/journey` | Levels, XP, quests, badges. |
| Profile | `/profile` | Settings, goals, health flags, integrations. |

## Route map

```
/
├── /                          Workbench (home)
├── /onboarding                Multi-step wizard (gated)
├── /search?q=…                Global search results, grouped by type
│
├── /library
│   ├── /library/saved
│   ├── /library/notes
│   ├── /library/highlights
│   ├── /library/files
│   └── /library/folders/[id]
│
├── /track
│   ├── /track                 All tracked biomarkers
│   ├── /track/[biomarkerId]   Single biomarker chart + readings
│   └── /track/log             Quick log a reading
│
├── /protocols
│   ├── /protocols             List
│   ├── /protocols/today       Today's actionable steps
│   ├── /protocols/new         Builder (assistant-coupled)
│   ├── /protocols/[id]
│   └── /protocols/[id]/edit
│
├── /journey
│   ├── /journey               Level + XP + active quests
│   └── /journey/quests/[id]
│
├── /profile
│   ├── /profile
│   ├── /profile/health
│   ├── /profile/integrations
│   ├── /profile/notifications
│   └── /profile/data          Export / delete
│
├── /assistant                 Full-screen assistant view
│
└── /e/                        Public knowledge graph entities
    ├── /e/podcasts/[slug]
    ├── /e/episodes/[slug]
    ├── /e/claims/[id]
    ├── /e/people/[slug]
    ├── /e/organizations/[slug]
    ├── /e/products/[slug]
    ├── /e/compounds/[slug]
    ├── /e/lab-tests/[slug]
    ├── /e/biomarkers/[slug]
    └── /e/case-studies/[slug]
```

The `/e/` namespace is shared (anyone can deep-link). The user-private namespaces (`/library`, `/track`, `/protocols`, `/journey`, `/profile`) are gated by Clerk's `clerkMiddleware()` in `proxy.ts` (Next 15+ rename of `middleware.ts`), with per-route `await auth.protect()` in RSC pages where we want a hard redirect.

## Entity model — what the user actually sees

```
                            ┌──────────────────┐
                            │   UserProfile    │ (goals, flags, level, xp)
                            └────────┬─────────┘
                                     │ owns
       ┌─────────────┬───────────────┼───────────────┬─────────────────┐
       ▼             ▼               ▼               ▼                 ▼
   SavedEntity     Note           Highlight       Protocol      UserBiomarker
       │            │                │              │                 │
       │            │                │           Step(s)            Reading(s)
       ▼            ▼                ▼              │
   any of  ─►  references       references          │ links
   public      public via       a span of           │
   entities    @-mentions       a source            ▼
                                                public Compound /
                                                Product / Biomarker

                            ┌──────────────────┐
                            │ AssistantThread  │ (per workspace)
                            └────────┬─────────┘
                                     │ has many
                              AssistantMessage
                                     │ produces / consumes
                                     ▼
                              tool-call audit trail
```

See [08 — Data Model Additions](./08-data-model-additions.md) for the Prisma deltas.

## URL-as-state principles

- The workbench layout is reflected in the URL: `?left=library&center=ep_abc,note_xyz&right=assistant&split=24-52-24`. This makes shareability and back-button trivial.
- Search filters live in query params (`/products?org=oura&category=ring&q=hrv`).
- The assistant pane reads the URL to know what's currently focused — context attachment is a function of route + selection, not stateful side-channels.

## Permissions matrix

| Resource | Anonymous | Signed-in | Owner |
|---|---|---|---|
| `/e/*` (public entities) | read | read | read |
| `/library`, `/track`, `/protocols`, `/journey`, `/profile` | redirect to login | own only | full |
| Save / Note / Highlight / Protocol / Reading mutations | — | own only | full |
| AI assistant | — | yes (with rate limits) | yes |
