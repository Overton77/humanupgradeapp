# 07 — Gamification & Journey

> "Becoming an Advanced Biohacker" — turn the discipline into a journey, not a chore.

The gamification layer wraps the existing primitives (saves, notes, protocols, readings) and rewards the user for the **behaviors that actually correlate with outcomes**, not for feed-scrolling.

---

## 1. Levels & tiers

10 numeric levels grouped into 4 named tiers.

| Tier | Levels | Required XP (cumulative) | Identity |
|---|---|---|---|
| **Curious** | 1 → 2 | 0 → 200 | Browses, saves, asks the assistant. |
| **Practitioner** | 3 → 5 | 200 → 1,800 | Has at least 1 active protocol and ≥ 3 tracked biomarkers. |
| **Operator** | 6 → 8 | 1,800 → 6,500 | Adherence > 70 % over 30 d, syncs from at least one device, monthly readings. |
| **Architect** | 9 → 10 | 6,500 → 15,000+ | Multi-protocol, quarterly labs, custom biomarkers, contributes notes/highlights regularly. |

XP-to-next-level curve (designed so the first jump is fast, then slows):

```
Lvl  1 →  2 :   200
Lvl  2 →  3 :   400
Lvl  3 →  4 :   600
Lvl  4 →  5 :   800
Lvl  5 →  6 : 1,200
Lvl  6 →  7 : 1,500
Lvl  7 →  8 : 2,000
Lvl  8 →  9 : 3,500
Lvl  9 → 10 : 4,800
```

A level-up triggers a celebratory toast + an unlock (e.g. *"Operator unlocked: protocol templates from advanced practitioners are now visible."*).

---

## 2. XP rules table

Each XP grant is deterministic and stored as an `XpEvent` for audit and undo. Anti-grinding caps below.

| Action | XP | Daily cap | Notes |
|---|---|---|---|
| Complete an onboarding step | +20 | one-shot | maxes at 6 steps total |
| Save an entity | +5 | 25/day | first save of an entity type bonus +20 once |
| Create a note (≥ 80 chars) | +15 | 60/day | |
| Create a highlight | +5 | 50/day | |
| @-mention an entity in a note | +2 | 30/day | rewards graph-building |
| Build a protocol | +100 | 200/day | |
| Add a protocol step | +10 | 100/day | |
| Complete a protocol step (DAILY+) | +10 | 60/day per step | |
| Complete a step with proof (📎/🔗) | +25 | 150/day | proof beats checkbox |
| Sync a reading from device | +25 | 200/day | requires source ≠ 'manual' |
| Log a manual reading | +10 | 100/day | |
| Hit a 7-day protocol streak | +50 | one-shot per protocol per week | |
| Hit a 30-day protocol streak | +250 | one-shot per protocol per month | |
| Complete a quest | +variable | per quest | quest-defined |
| Get a level-up | bonus +100 | one-shot per level | |

The **assistant** can call `awardXp` for richer events:

- *+50 — "Linked your wind-down protocol to your HRV biomarker for the first time"*
- *+30 — "Resolved a contradiction between two saved claims"*

These have a server-side allowlist so the assistant cannot invent reasons.

---

## 3. Quests

A **Quest** is a server-issued multi-step mission with a clear narrative arc, a finite scope, and a guaranteed XP payoff. Unlike achievements, quests are *prescribed* and *guided*. The assistant becomes the narrator.

```ts
type Quest = {
  id: string
  slug: string
  title: string
  narrative: string                    // one-paragraph "why this matters"
  steps: QuestStep[]
  xpReward: number
  badgeRewardSlug?: string
  prerequisiteLevel?: number
  unlockCondition?: 'OnboardingComplete' | 'HasActiveProtocol' | ...
}

type QuestStep = {
  id: string
  title: string
  description: string
  // verification — exactly one of:
  verify:
    | { kind: 'profileField',  field: keyof UserProfile, isSet: true }
    | { kind: 'savedCount',    entityType: EntityType, gte: number }
    | { kind: 'protocolExists', withGoal?: Goal }
    | { kind: 'stepWithLayer',  layer: TimeLayer, gte: number }
    | { kind: 'readingsCount',  biomarkerSlug?: string, gte: number, withinDays?: number }
    | { kind: 'highlightsOnEntity', entityType: EntityType, gte: number }
    | { kind: 'syncSource',     source: BiomarkerSource }
}
```

### Starter quest set (ships with v1)

1. **Set your foundation** — finish onboarding, pick goals, write a 1-line *"why now"* in profile.
2. **Map your circadian week** — log light exposure, sleep onset, wake time for 7 consecutive days.
3. **Define your sleep baseline** — sync 14 nights of sleep data OR enter manually.
4. **Pick & log 5 biomarkers** — track 5, log at least 1 reading on each.
5. **Build your morning protocol** — create a `DAILY` protocol with ≥ 3 steps, run it for 7 days.
6. **Run your first weekly review** — complete a `WEEKLY` retrospective step.
7. **Wire a feedback loop** — link a step to a tracked biomarker and log 4 readings while running it.
8. **Order your first lab panel** — record 5 biomarker readings from a single source dated within 7 days.
9. **Find a contradiction** — save 2 claims with opposing stances on the same compound or topic, write a note about it.
10. **Become an Operator** — reach Level 6.

The assistant can offer *"start this quest now?"* on any compatible context (e.g. on a Sleep episode → quest #3).

---

## 4. Streaks

Two kinds:

- **Per-protocol streak** — consecutive days where ≥ 80 % of that protocol's daily steps were checked. Visible on the protocol header. Breaks reset to 0.
- **Engagement streak** — any meaningful day (any check-in, reading, note). Visible in the journey view.

Streak protection: 1 free "rest day" per week before the streak resets. Surfaced as a toast: *"Yesterday was a rest day. Streak preserved."*

---

## 5. Badges

Badges are visible only to the user in v1 (no social sharing yet). They are **lagging recognition** — they cannot be sought directly, only earned by repeat behavior.

Examples:

- 🪪 **Curious** — first save (auto-granted)
- 🪪 **First Highlight** — first highlight created
- 🪪 **12-day Streak** — protocol streak ≥ 12
- 🪪 **Operator** — reach tier
- 🪪 **Lab Hacker** — upload your first lab PDF
- 🪪 **Citation Sleuth** — open ≥ 50 entities from assistant citations
- 🪪 **Self-Builder** — create your first custom biomarker
- 🪪 **Architect** — reach Level 10

---

## 6. The assistant's narrator role

The journey is most powerful when the assistant *embodies* it:

- On level-up, the assistant fires a contextual congratulation that references *what the user actually did* (not generic): *"Operator unlocked. The thing that pushed you over the line was 14 nights of synced sleep — that's the kind of foundation a lot of people skip."*
- The assistant can call `proposeQuest({slug})` to suggest a quest mid-conversation; the user accepts/declines via an inline card.
- "Coach mode" toggle: when on, the assistant proactively prompts the user once per day with a quest-aligned next action. When off, it only responds when asked.

---

## 7. Anti-patterns we explicitly avoid

- ❌ Daily login bonuses for showing up. (We reward *behaviors*, not *appearance*.)
- ❌ Loot-box / RNG mechanics.
- ❌ Public leaderboards in v1 (tempting but premature; risks turning health into competition).
- ❌ Push notifications outside the user's chosen quiet hours.
- ❌ Awarding XP for AI conversations themselves (we don't want to incentivize chatting for its own sake).

---

## 8. Data model needs

Adds the following user-owned tables (full schema in [08 — Data Model Additions](./08-data-model-additions.md)):

- `XpEvent` — append-only log; the source of truth for user.xp.
- `Quest` & `QuestStep` — global definitions (versioned).
- `UserQuest` & `UserQuestStep` — per-user progress.
- `Badge` & `UserBadge`.
- `Streak` — derived but cached for fast read.
