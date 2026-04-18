# Milestones — HumanUpgrade

Operational dashboard. The strategic view lives in [docs/10 — Scope & Roadmap](../docs/10-scope-roadmap.md).

## Status

| ID | Name | Status | Plan | Started | Done |
|---|---|---|---|---|---|
| **M0** | Foundation (monorepo, Vercel, public entity pages) | ✅ done | [plan](M0-foundation/plan.md) · [delta](M0-foundation/delta.md) | 2026-04-17 | 2026-04-18 |
| M1 | Auth & library shell (Clerk + saves + notes) | ⬜ — | — | — | — |
| M2 | Assistant v0 — interactive | ⬜ — | — | — | — |
| M2.5 | Durable assistant (Workflow SDK) | ⬜ — | — | — | — |
| M3 | Protocols + biomarkers + long-running AI tools | ⬜ — | — | — | — |
| M4 | Workbench polish + journey | ⬜ — | — | — | — |
| M5 | Hardening → v1 | ⬜ — | — | — | — |

**Status legend:** ⬜ not started · 🟦 planning · 🟡 in-progress · ✅ done · ⛔ blocked · ⏸ paused

## How a milestone works

1. **You ask:** "Plan milestone Mn."
2. **Planning session:** I read the relevant docs + skills, explore both codebases, optionally fetch external docs, and produce `Mn-…/plan.md` + `research.md` + `references.md`. Status flips to 🟦 planning.
3. **You approve.**
4. **Build session:** I execute the plan. Status flips to 🟡 in-progress. Deliverables get checked off in `plan.md` as they land.
5. **On completion:** I write `delta.md` (what changed in the spec docs as a result), bump status to ✅ done in this index, and add the headline e2e test.

Planning and building are explicitly separate sessions — the plan is the contract.

## Per-milestone files

| File | Purpose |
|---|---|
| `plan.md` | The build plan — scope, deliverables, API work, client work, DoD checklist. |
| `research.md` | Findings from exploration that informed the plan. |
| `references.md` | Citation index — every doc, skill, URL, and past chat consulted. |
| `delta.md` | Filled in on completion: doc deltas + commit pointers + actually-shipped surface. |

A copy-this template lives in [`_template/`](./_template/).
