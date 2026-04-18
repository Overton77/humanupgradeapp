# 06 — Protocols, Biomarkers & Tracking

This is where the **7-layer time model** from your brain-dump becomes a real product surface. The model is not exposed as an academic curiosity — it is the spine that organizes every protocol step, every check-in, and every chart overlay.

---

## 1. The 7 layers as an enum

```ts
enum TimeLayer {
  CONTINUOUS = 'CONTINUOUS', // ms → s, passive, sensor-driven
  MINUTE     = 'MINUTE',     // 1–10 min micro-interventions
  HOURLY     = 'HOURLY',     // metabolic / cognitive arcs
  DAILY      = 'DAILY',      // primary control loop
  WEEKLY     = 'WEEKLY',     // adaptation
  MONTHLY    = 'MONTHLY',    // biochemical / structural
  QUARTERLY  = 'QUARTERLY',  // strategic
  ANNUAL     = 'ANNUAL',     // recalibration
}
```

(8 layers if you count CONTINUOUS — your model also calls it "Layer 0". We expose all 8.)

Every `ProtocolStep` is tagged with **exactly one** layer. Every `BiomarkerReading` infers a layer from cadence. The UI uses the layer for grouping, color, and rendering style:

| Layer | Color | Rendering style | Default check-in UX |
|---|---|---|---|
| CONTINUOUS | slate | sparkline tile, no manual ✅ | sync-only |
| MINUTE | sky | reminder chips | swipe ✅ |
| HOURLY | cyan | hour-grid | tap ✅ |
| DAILY | emerald | "today" list | ✅ + 📎 + 🔗 |
| WEEKLY | amber | weekly card | ✅ + chart |
| MONTHLY | violet | monthly card | reading + note |
| QUARTERLY | fuchsia | calendar reminder | reading panel + retro |
| ANNUAL | rose | yearly retrospective | retro form |

---

## 2. Protocols — composition

A `Protocol` has:

- `title`, `description`
- `goalIds[]` (which user goals it serves — Sleep, HRV, etc.)
- `status` (`DRAFT | ACTIVE | PAUSED | ARCHIVED`)
- `startDate`, optional `endDate`
- `visibility` (private only in v1)
- A list of `ProtocolStep`s

A `ProtocolStep` has:

- `title`, `description`
- `layer: TimeLayer`
- `cadence` — a structured object, not a cron string:
  ```ts
  type Cadence =
    | { kind: 'continuous' }
    | { kind: 'everyN',   minutes: number }                       // e.g. every 60 min
    | { kind: 'daily',    times: string[] }                       // ['06:30','22:00']
    | { kind: 'weekly',   daysOfWeek: number[], time?: string }   // [1,3,5]
    | { kind: 'monthly',  dayOfMonth: number }                    // 1
    | { kind: 'quarterly' | 'annual',  monthOffset: number, dayOfMonth?: number }
    | { kind: 'asNeeded',  trigger: string }                      // 'after meals', 'on travel'
  ```
- `linkedEntities` — an array of typed refs to public entities: `Compound[]`, `Product[]`, `Biomarker[]`, `CaseStudy[]`, `Episode[]`. These are how the assistant grounds the step.
- `expectedOutcome` (free text, used by the assistant for retrospective evaluation)
- `metricBiomarkerId?` — when set, the step is "scored" by movement on that biomarker
- `proofRequirement: 'NONE' | 'CHECKIN' | 'PHOTO' | 'FILE' | 'SYNC'`

---

## 3. Today view (the daily control loop)

`/protocols/today` is the user's daily home (could replace `/` for power users):

```
TODAY · Apr 17, 2026                                Streak 12 🔥

▼ Morning (06:00–10:00)
   ☀ Outdoor light · 10 min          DAILY · 06:30   [✅] [📎] [🔗]
   🥩 Protein-forward breakfast      DAILY · 06:45   [✅]
   🧘 Box breathing 5 min            MINUTE          [✅]

▼ Workday (10:00–17:00)
   🚶 5-min walk per hour            HOURLY          [✅ ×3 / 7]
   ☕ Caffeine cutoff 14:00          DAILY · 14:00   [✅]

▼ Evening (17:00–22:30)
   🌅 Low-lux mode, red spectrum     DAILY · 19:00   [✅]
   🍽 Last meal 3h before sleep      DAILY · 19:30   [✅]

▼ Sleep (22:30–06:00)
   💤 Bedroom 18 °C, dark, quiet     DAILY · 22:30   [✅] [🔗 Oura]

▼ This week
   📊 Sun · Review HRV 7-day rolling                  WEEKLY  [open]

▼ This month
   🩸 Apr 30 · Fasting insulin + ApoB                 MONTHLY [book]
```

Each `[🔗]` triggers a sync action against an integration; in v1 it's a "Mark synced" action that the user clicks after pasting from their tracker.

---

## 4. Biomarker tracking

Two kinds:

- **Curated biomarker** — pinned to a row in the existing `Biomarker` table (e.g. *HRV RMSSD*).
- **Custom biomarker** — user defined: name, unit, optional reference range, optional category. Stored as `UserBiomarker { biomarkerId? OR custom fields }`.

A `UserBiomarker` is what the user *tracks*. A `BiomarkerReading` is a single observation:

```ts
type BiomarkerReading = {
  id: string
  userBiomarkerId: string
  value: number
  unit?: string
  takenAt: Date
  source: 'manual' | 'oura' | 'whoop' | 'apple_health' | 'dexcom' | 'lab' | 'csv'
  rawSourcePayload?: Json   // when synced from device or parsed from PDF
  protocolStepRefs?: string[]  // optional attribution to active steps
  note?: string
}
```

### Chart features

- Reference band shaded behind the line.
- Vertical bands for periods when a relevant Protocol was ACTIVE (driven by `linkedEntities` matching).
- Hover tooltip shows: value · source · any active steps that day · notes.
- Right-side stats: 7-day mean, 30-day slope, % change vs baseline.
- "Insights" computed server-side: simple correlation between adherence and reading slope.

---

## 5. From layer model → server jobs

The 7-layer model also drives **server-side cadences**:

| Job | Trigger | Action |
|---|---|---|
| `recomputeRecommendations(userId)` | on save / log / protocol mutation, debounced 30 s | refreshes the user's "Recommended for you" cache |
| `recomputeTrending()` | every 1 h | refreshes global trending cache |
| `recomputeAdherence(protocolId)` | on step check-in | rolling 30-day adherence per step + protocol |
| `recomputeBiomarkerInsights(userBiomarkerId)` | on new reading | mean / slope / overlay correlation |
| `digestQuestProgress(userId)` | on XP event | bumps quest progress, may issue new quests |
| `pruneAssistantThread(threadId)` | on every 8 turns | summarizes older turns into thread memory |

All jobs are simple Postgres-driven, idempotent, and run from Vercel cron + on-mutation `await waitUntil(...)` from server actions.

---

## 6. Mapping your brain-dump → product

This is the explicit map from your time-layer notes to where each idea lives in the app:

| From your model | Product surface |
|---|---|
| Continuous: HR, HRV, glucose, sleep, ambient | `CONTINUOUS` steps + sparkline tiles on Today; integration-driven, no manual check-ins |
| Minute: breathing, walks, glucose corrections | `MINUTE` steps with reminder chips |
| Hourly: glucose curve shape, deep work blocks | `HOURLY` steps; assistant can label deep-work blocks via a tool |
| Daily: morning / midday / evening / sleep | The Today view's four sections |
| Weekly: HRV trend, training periodization | `WEEKLY` steps + weekly retro card on Sunday |
| Monthly: blood markers, body comp, hormones | `MONTHLY` steps; readings flow into biomarker charts |
| Quarterly: full panels, imaging, VO2 | `QUARTERLY` steps; calendar booking helpers (out of v1, link-out only) |
| Annual: full clinical workup, biological age | `ANNUAL` retrospective view |
| "Trend > snapshot" | Charts default to slope, not single values |
| "Coupling between layers" | Insights panel correlates layers (sleep ↘ → HRV ↘) |
| "Constraint hierarchy" | Onboarding + Goals UI nudges users toward Sleep > Metabolic > CV > Strength ordering when they pick conflicting priorities |
| "Intervention minimalism" | Protocol builder shows a "complexity score" — the assistant warns when a draft protocol exceeds ~7 active daily steps |

---

## 7. Open questions to nail before build

- What's the minimum-viable integration story? (proposal: v1 manual + CSV; v1.1 OAuth Apple Health & Oura.)
- Do we model "schedules" as their own entity, or always inline on `ProtocolStep.cadence`? (proposal: inline, JSONB; promote later if needed.)
- How do we handle multiple concurrent active protocols overlapping on the same step time? (proposal: dedupe in the Today view by `linkedEntities + cadence` hash.)
