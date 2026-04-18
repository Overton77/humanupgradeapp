# 04 — Layouts & Wireframes

All wireframes are **3-pane workbench** unless noted. The center pane is tabbed. Every pane has a collapse handle (`◀ ▶`) and resize handle (`║`).

Legend: `[ … ]` = button · `· · ·` = scroll/overflow · `▣` = filled card · `▢` = empty card.

---

## 1. Workbench / Home (`/`)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ HumanUpgrade   [⌘K  Search anything…]      🏠  📚  🧪  🧭  🎯           Lvl 4 · 1,240 XP 👤│
├──────────────┬─────────────────────────────────────────────────────────────┬───────────────┤
│ ◀ LIBRARY    │ ▼ Today, Apr 17                                          ⛶  │ ASSISTANT  ⛶ ▶│
│              │                                                             │               │
│ Saved (87)   │  ┌───────────────── Continue where you left off ─────────┐  │  Hi Pinda 👋  │
│  ▣ Episode   │  │ ▣ "Optimizing HRV" — Huberman Lab #182                │  │               │
│  ▣ Compound  │  │   you highlighted 4 spans  ·  3 days ago  · [open]    │  │  Suggestions: │
│  ▣ Product   │  └───────────────────────────────────────────────────────┘  │  ─────────────│
│  ▣ Case Std  │                                                             │  • Draft a    │
│  ▢ …         │  ▼ Recommended for your goals (Sleep, Cognition)            │    sleep      │
│              │  ┌────────────┬────────────┬────────────┬──────────────┐    │    protocol   │
│ Notes (12)   │  │ Compound   │ Episode    │ Case Study │ Product      │    │    from your  │
│  ▣ Sleep PM  │  │ Glycine    │ Sleep      │ Mg L-thr.  │ Magnesium    │    │    last       │
│  ▣ HRV Q2    │  │ • Sleep    │ stages 101 │ cognition  │ Glycinate    │    │    highlight? │
│              │  │ • GABA     │ Walker     │ + sleep    │ Pure Encaps. │    │  • Log this   │
│ Folders      │  │ [Save] [↗] │ [Save] [↗] │ [Save] [↗] │ [Save] [↗]   │    │    week's HRV │
│  📁 Sleep    │  └────────────┴────────────┴────────────┴──────────────┘    │  • Pick 2     │
│  📁 Training │                                                             │    biomarkers │
│  📁 Labs     │  ▼ Trending                                                 │    to add     │
│              │  ┌────────────┬────────────┬────────────┬──────────────┐    │  ─────────────│
│ Highlights   │  │ Episode    │ Person     │ Compound   │ Episode      │    │               │
│ (34)         │  │ Cold ther. │ A. Lustgarten│ NMN      │ Zone 2 myth  │    │  ┌──────────┐ │
│  ▣ "spike"   │  └────────────┴────────────┴────────────┴──────────────┘    │  │  Ask…    │ │
│  ▣ "AUC"     │                                                             │  │          │ │
│              │  ▼ Active protocols (2)                                     │  │ ⊕ Attach │ │
│ Files        │  ▣ Morning circadian anchor   · 12-day streak  · [open]    │  └──────────┘ │
│  📄 lab.pdf  │  ▣ Pre-bed wind-down          ·  4-day streak  · [open]    │      [Send]   │
│              │                                                             │               │
└──────────────┴─────────────────────────────────────────────────────────────┴───────────────┘
   ║ resize ║                       ║ resize ║                                   ║ resize ║
```

Behavior:

- **Recommended** and **Trending** rails are server-rendered, fed by recompute jobs.
- The right pane's **Suggestions** are derived from the URL focus (here: home → goal-aware suggestions).
- Drag a card from any rail → drop on the assistant composer to attach as context.

---

## 2. Entity Detail — Episode (`/e/episodes/[slug]`)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ HumanUpgrade   [⌘K …]      🏠 📚 🧪 🧭 🎯                              Lvl 4 · 1,240 XP 👤 │
├──────────────┬─────────────────────────────────────────────────────────────┬───────────────┤
│ ◀ RELATIONS  │ ◀  Episodes / Huberman Lab / #182  ⭐ Save  ⤴ Share  💬 Ask │ ASSISTANT  ⛶ ▶│
│              │                                                             │               │
│ Guests       │  Optimizing HRV: training,                                  │  Context:     │
│  • Andy G.   │  breath, recovery and sleep                                 │  ▣ Episode    │
│  • Foster    │  ───────────────────────────────────────────────            │   "HRV …"    │
│              │  ▶ Huberman Lab · 1h 47m · Apr 2024                         │  ▣ Highlight  │
│ Sponsors     │                                                             │   "magnitude  │
│  • Eight Sl. │  ┌────────────────── YouTube embed / audio ──────────────┐  │    of slow    │
│  • LMNT      │  │                                                       │  │    breathing"│
│              │  │              [ ▶ play  --o-------- 12:33 ]            │  │               │
│ Claims (47)  │  └───────────────────────────────────────────────────────┘  │  Quick acts:  │
│  HIGH (12)   │                                                             │  [Summarize]  │
│  MED  (28)   │  Tabs: [ Transcript ] [ Claims ] [ Sponsors ] [ Media ]     │  [Make protl]│
│  LOW  (7)    │  ────────────────────────────────────────────────────────   │  [Compare to │
│              │                                                             │   episode #45]│
│ Compounds    │  12:33  ANDREW: "...the magnitude of slow breathing on      │               │
│  • Mg-thr.   │           HRV is largely driven by exhalation length…"      │  ┌──────────┐ │
│  • L-theanin │  ─── highlighted (you) ───                                 │  │ Ask…     │ │
│              │  13:01  ANDREW: "we typically see RMSSD increase by ~12%…" │  │          │ │
│ Products     │  13:45  ANDY:    "…and that maps onto subjective recovery."│  │ ⊕ Attach │ │
│  • Eight Pod │   · · ·                                                     │  └──────────┘ │
│              │                                                             │      [Send]   │
│ Case studies │  ▼ Mini graph                                               │               │
│  • Lehrer 14 │  [ Episode ●─── Compound ●── Biomarker ● ]                  │               │
└──────────────┴─────────────────────────────────────────────────────────────┴───────────────┘
```

Interactions:

- Selecting any text in the transcript pops a **highlight toolbar**: `[ Highlight ] [ Add to note ] [ Ask AI ] [ Add as protocol step ]`.
- Each Claim chip in the relation rail can be opened in a tab inside the center pane — opens the `Claim` detail mid-pane without losing the episode.
- "Make protocol" button in assistant pre-fills the assistant with: `episode + selected highlights + user goals` and switches to protocol-builder mode.

---

## 3. Protocol Detail (`/protocols/[id]`)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ HumanUpgrade   …                                                       Lvl 4 · 1,240 XP 👤 │
├──────────────┬─────────────────────────────────────────────────────────────┬───────────────┤
│ ◀ PROTOCOLS  │ ◀ Protocols / Morning circadian anchor       [● Active] ⛶  │ ASSISTANT     │
│              │                                                             │               │
│ Active (2)   │  Goal: Sleep, Cognition  ·  Started Apr 5  ·  Streak 12 🔥  │  Context:     │
│  ▣ Morning…  │  ───────────────────────────────────────────────────────── │  ▣ Protocol   │
│  ▣ Wind-down │                                                             │   Morning…   │
│              │  Steps                              [ + Add step ] [ AI ▶ ] │               │
│ Drafts (1)   │  ┌────────────────────────────────────────────────────┐    │  Helpful:     │
│  ▢ Zone 2…   │  │ DAILY · 06:30   ☀ Outdoor light, 10 min            │    │  • Convert    │
│              │  │   linked: Biomarker[Cortisol AM]                   │    │    AM light   │
│ Archived(0)  │  │   [ ✅ Today ] [ 📎 Proof ] [ 🔗 Sync from Oura ]   │    │    to weekly  │
│              │  ├────────────────────────────────────────────────────┤    │    target     │
│              │  │ DAILY · 06:45   🥩 Protein-forward breakfast 30g+  │    │  • Add a CGM  │
│              │  │   linked: Compound[Leucine] · UserBio[Glucose AM]  │    │    correlate  │
│              │  │   [ ✅ ] [ 📎 ] [ 🔗 ]                              │    │    step       │
│              │  ├────────────────────────────────────────────────────┤    │               │
│              │  │ HOURLY · 09–17  🚶 5-min walk per hour             │    │  ┌──────────┐ │
│              │  │   layer: HOURLY  · cadence: every hour             │    │  │ Ask…     │ │
│              │  │   [ ✅ ] [ 📎 ] [ 🔗 ]                              │    │  └──────────┘ │
│              │  ├────────────────────────────────────────────────────┤    │      [Send]   │
│              │  │ WEEKLY · Sun   📊 Review HRV 7-day rolling         │    │               │
│              │  │   linked: UserBio[HRV RMSSD]                       │    │               │
│              │  │   [ ✅ ] [ 📎 ] [ 🔗 ]                              │    │               │
│              │  └────────────────────────────────────────────────────┘    │               │
│              │                                                             │               │
│              │  Adherence (last 30 d)  ▒▒▒▒▒▒▒▒▒░░░░ 78%                  │               │
│              │  Linked biomarker trend: HRV RMSSD ↗ +9% vs baseline        │               │
└──────────────┴─────────────────────────────────────────────────────────────┴───────────────┘
```

---

## 4. Biomarker Tracking (`/track/[biomarkerId]`)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ ◀ TRACK        HRV RMSSD (ms)            [ + Log reading ]  [ Import CSV ]   ASSISTANT  ▶  │
├──────────────┬─────────────────────────────────────────────────────────────┬───────────────┤
│ Tracking(8)  │  Range: [ 7d  30d  90d  1y  All ]    Source: [ All  Oura ]  │ Context: HRV  │
│  ▣ HRV       │                                                             │               │
│  ▣ Glucose   │  ms                                                         │ Insights:     │
│  ▣ ApoB      │  80┤                ╭─●         ╭─●                         │ • +9% in past │
│  ▣ HsCRP     │  70┤    ●─╮     ●──╯           ╰──●─╮     ●─                │   30d (n=27)  │
│  ▣ Sleep…    │  60┤────●─●─────────────────────────●─────●──── ref upper  │ • Best on     │
│  ▣ Tempera   │  50┤                                                        │   days you    │
│  ▣ Steps     │  40┤────────────────────────────────────────── ref lower    │   ran "Wind-  │
│              │     ┴────┬────┬────┬────┬────┬────┬────┬────┬────           │   down" (+14)│
│ Custom (1)   │     Mar 17   24  31  Apr 7   14   21   28  May 5            │ • Bad on cold │
│  ▣ Mood/10   │                                                             │   evenings    │
│              │  Overlays: ▣ Wind-down protocol  ▣ Travel days  ▢ Caffeine  │               │
│ + add        │                                                             │ ┌──────────┐  │
│              │  Recent readings                                            │ │ Ask…     │  │
│              │  Apr 17  06:12   72 ms   Oura      [ … ]                    │ └──────────┘  │
│              │  Apr 16  06:08   68 ms   Oura      [ … ]                    │     [Send]    │
│              │  Apr 15  06:09   64 ms   manual    [ note ]                 │               │
└──────────────┴─────────────────────────────────────────────────────────────┴───────────────┘
```

---

## 5. AI Assistant — Full screen (`/assistant`)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ ◀ Conversations   New thread (Apr 17)                                            ⛶ exit  ⌘J│
├──────────────┬─────────────────────────────────────────────────────────────┬───────────────┤
│ Today        │  USER:                                                      │ CONTEXT       │
│  · Sleep dr  │  Build me a protocol for improving HRV in 8 weeks           │  ─────────────│
│  · Lab Q2    │  using my last lab and the wind-down episode I saved        │ Auto:         │
│              │                                                             │  • Profile    │
│ Yesterday    │  ASSISTANT (streaming…):                                    │  • Goals: HRV │
│  · CGM walk  │  Looking at your profile (goals: Sleep, HRV) and recent     │  Manual:      │
│              │  RMSSD trend (avg 64 → 72 last 30 d), I'd build this:       │  ▣ Lab PDF   │
│ This week    │                                                             │     "Q2 2026" │
│  · Mg comp.  │  1. Daily PM wind-down — 30 min, low lux, nasal-only        │  ▣ Episode   │
│              │     breathing 6-bpm  →  derived from claim #c_482  ⓘ        │     #182     │
│              │  2. Weekly Zone 2 — 3× 45 min  →  Inigo San Millán ep.  ⓘ   │ [+ Attach]   │
│              │  3. Monthly check — RMSSD baseline, adjust cadence           │               │
│              │                                                             │ Tools used:   │
│              │  Want me to save this as a protocol and link your HRV       │  ✓ search     │
│              │  biomarker so we can chart adherence vs RMSSD?              │  ✓ getEntity  │
│              │                                                             │  ⏳ propose-   │
│              │  [ ✅ Save protocol ]   [ ✏ Tweak ]   [ Add Mg step ]      │     Protocol  │
│              │                                                             │               │
│              │  ┌──────────────────────────────────────────────────────┐   │               │
│              │  │ Ask…                                                 │   │               │
│              │  │ ⊕ Attach   🎙 Voice                                  │   │               │
│              │  └──────────────────────────────────────────────────────┘   │               │
│              │                                                  [ Send ]   │               │
└──────────────┴─────────────────────────────────────────────────────────────┴───────────────┘
```

---

## 6. Onboarding wizard (`/onboarding`)

```
                  Step 3 of 6  ·  ●●●○○○

┌──────────────────────────────────────────────────────────────────┐
│  What are you optimizing for?                                    │
│                                                                  │
│  Pick 1 primary goal                                             │
│  (●) Sleep    ( ) Cognition    ( ) Longevity                     │
│  ( ) Energy   ( ) Strength     ( ) VO2 Max                       │
│  ( ) Metabolic Health  ( ) Stress  ( ) Body Comp  ( ) Hormonal   │
│                                                                  │
│  Pick up to 3 secondary goals                                    │
│  [✓] Cognition  [✓] HRV  [ ] Strength  [ ] …                    │
│                                                                  │
│  Why this matters                                                │
│  Your assistant will weigh recommendations and protocols         │
│  against your primary goal first, then secondaries.              │
│                                                                  │
│            [ ← Back ]                       [ Continue → ]       │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. Search results (`/search?q=hrv`)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ Search:  hrv                                          [ All  Episode  Compound  Product …]│
├────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                            │
│  EPISODES (12)                                                                  see all → │
│  ▣ Optimizing HRV — Huberman #182        breath, recovery, sleep         [Save] [Open]    │
│  ▣ HRV myths — Peter Attia #143          methodological pitfalls         [Save] [Open]    │
│                                                                                            │
│  COMPOUNDS (5)                                                                  see all → │
│  ▣ Magnesium L-threonate                  CNS bioavailability  · in 14 products           │
│  ▣ Glycine                                GABA pathway        · in 9 products              │
│                                                                                            │
│  CASE STUDIES (8)                                                               see all → │
│  ▣ Slow breathing & HRV (Lehrer, 2014)    n=84, 8 weeks                  [Save] [Open]    │
│                                                                                            │
│  BIOMARKERS (3)                                                                 see all → │
│  ▣ HRV RMSSD                              ms · category: cardiovascular  [+ Track]        │
│                                                                                            │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Library — Notes editor (`/library/notes/[id]`)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ ◀ NOTES        Sleep PM ideas                       [ Tag: sleep ▾ ] [ Folder: Sleep ▾ ]   │
├──────────────┬─────────────────────────────────────────────────────────────┬───────────────┤
│ All notes    │ # Sleep PM ideas                                            │ ASSISTANT     │
│  ▣ Sleep PM  │                                                             │ Context:      │
│  ▣ HRV Q2    │ - Wind-down 30 min, low lux                                 │ ▣ this note  │
│  ▣ Travel    │ - 6-bpm box breathing  ← from @ep_huberman_182             │               │
│              │ - Mg L-thr 144 mg ← @cmp_magnesium_l_threonate              │ Quick acts:   │
│              │   - referenced in @prod_pure_encaps_mag_thr                 │ • Convert to  │
│              │                                                             │   protocol    │
│              │ ## Open questions                                           │ • Find        │
│              │ - Does pre-bed nasal breathing improve deep %?              │   contradict. │
│              │   - @cs_lehrer_2014 says yes for RMSSD                      │ • Summarize   │
│              │                                                             │               │
│              │ Selecting "@ep_huberman_182" shows a hover card:            │ ┌──────────┐  │
│              │  ┌────────────────────────────────────────┐                 │ │ Ask…     │  │
│              │  │ Episode  ·  Huberman Lab #182           │                 │ └──────────┘  │
│              │  │ Optimizing HRV: training, breath…       │                 │     [Send]    │
│              │  │ [Open]  [Pin to right pane]             │                 │               │
│              │  └────────────────────────────────────────┘                 │               │
└──────────────┴─────────────────────────────────────────────────────────────┴───────────────┘
```

---

## 9. Journey (`/journey`)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ Your Journey                                                            Lvl 4 · 1,240 XP 👤│
├────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                            │
│   PRACTITIONER  ─────────────────●───────────────────  OPERATOR                            │
│   Lvl 1 ··········· 4 ································ 7 ··········· 10                  │
│                                                                                            │
│   1,240 / 1,800 XP to next level   ████████░░  68 %                                       │
│                                                                                            │
│   ── Active quests (3) ─────────────────────────────────────────────────                  │
│   ☐ Map your circadian week                       progress 3/7   +250 XP   [open]          │
│   ☐ Define your sleep baseline                    progress 5/7   +180 XP   [open]          │
│   ☐ Pick & log 5 biomarkers                       progress 4/5   +120 XP   [open]          │
│                                                                                            │
│   ── Recent XP ──────────────────────────────────────────────────────────                  │
│   +25  Logged HRV reading from Oura          2h ago                                        │
│   +50  Completed step "Outdoor light"         today                                         │
│   +100 Built protocol "Wind-down"             yesterday                                     │
│                                                                                            │
│   ── Badges ────────────────────────────────────────────────────────────                   │
│   🪪 Curious   🪪 First Highlight   🪪 12-day Streak   🔒 Lab Hacker                      │
│                                                                                            │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Resizable panes — interaction spec

```
   collapsed                 default                   maximized
┌────┬────────────┐      ┌────┬────┬────┐         ┌──────────────┐
│ ▶  │            │      │    │    │    │         │              │
│    │            │      │ L  │ C  │ R  │         │      C       │
│    │            │      │    │    │    │         │              │
└────┴────────────┘      └────┴────┴────┘         └──────────────┘
   double-click ║                                    ⛶ button
```

- Each pane has min/max widths: L `[160, 480]`, C `[480, ∞]`, R `[280, 640]`.
- Splitter ratios persisted as `userId + route → [l%, c%, r%]` in localStorage *and* mirrored to URL on share.
- Mobile: panes become tabs at the bottom (`Library | Workspace | Assistant`).
