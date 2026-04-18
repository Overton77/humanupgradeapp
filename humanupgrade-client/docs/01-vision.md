# 01 — Vision & Product Pillars

## The problem

Serious biohackers operate across an exhausting toolchain:

- A note app for highlights from podcasts and papers.
- A spreadsheet for biomarker trends.
- A wearable app for HRV / sleep / glucose.
- A second spreadsheet for supplements and timings.
- ChatGPT, with no memory of any of it.

Every tool is a silo. The graph between *"this claim"* → *"this compound"* → *"this product I bought"* → *"this biomarker that moved"* lives only in the user's head, and decays fast.

## The product

**HumanUpgrade is a single workbench where the public knowledge graph and the user's private practice live side by side, joined by an AI assistant that can see both.**

Everything in the app is either:

1. A **public entity** (Podcast, Episode, Claim, Person, Organization, Product, Compound, LabTest, Biomarker, CaseStudy, Media) — the curated graph that already lives in `humanupgradeapi`.
2. A **personal artifact** (Saved item, Note, Highlight, Protocol, Protocol Step, Tracked Biomarker, Reading, Journey Quest, XP Event) — to be added.
3. An **AI assistant turn** that can read both, write the second, and cite the first.

## Four product pillars

### Pillar 1 — Knowledge Graph as a first-class citizen

Browsing an Episode shows its sponsors, guests, claims, referenced products, the compounds in those products, the biomarkers those compounds affect, and any case studies that back the claim. **No dead ends.** Every entity card is a launchpad to its neighbors.

### Pillar 2 — A workbench, not a feed

The default screen is a multi-pane workbench (Entities | Notes/Protocols | Assistant). Each pane is independently resizable, collapsible, and droppable. It feels like a research IDE for your body.

### Pillar 3 — A context-aware Assistant, not a chatbot

The assistant is not a separate page. It is always one keystroke away (`⌘K` opens it; `⌘J` toggles the side pane). It sees the user's profile, their open entity, their selected highlight, their active protocol, and their latest biomarker readings. It can call tools to *write* (create a protocol, add a step, save an entity, attach a note).

### Pillar 4 — Closed-loop tracking with a journey

The 7-layer time model (continuous → annual) becomes a tracking spine. Each protocol step lives at a layer, generates a check-in cadence, and the AI guides the user up "Biohacker Levels" by completing, syncing, or proving steps. Recommendations are recomputed server-side on every meaningful mutation.

## Non-goals (for v1)

- We are not a wearable. We integrate with them later (Apple Health, Whoop, Oura, Dexcom) but v1 lets the user enter / paste / upload data.
- We are not a marketplace. Products are referenced, not sold.
- We are not a social network. No public profiles, no feed of other users in v1.
- We are not a medical device. All copy must say *educational, not medical advice.*

## Success looks like

A user lands on the homepage, takes a 4-minute onboarding, lands in the workbench with 3 starter quests ("Define your sleep baseline", "Pick 5 biomarkers to track", "Build your morning protocol"), drags an episode highlight into the assistant, and 30 seconds later has a draft protocol saved to their profile.
