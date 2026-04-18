# HumanUpgrade — Client App Specification

> A precision biohacking workbench. The user explores a curated knowledge graph of podcasts, claims, compounds, products, lab tests, biomarkers, organizations, people and case studies, and turns it into a personal protocol they actually run — guided end-to-end by a context-aware, durable AI Assistant.

This folder is the source of truth for what we are building on top of the existing `humanupgradeapi` GraphQL API and what changes the API needs to support it.

## Documents

| # | Doc | Purpose |
|---|---|---|
| 01 | [Vision & Product Pillars](./docs/01-vision.md) | Why the app exists, who it serves, the four product pillars. |
| 02 | [Feature Specification](./docs/02-feature-spec.md) | Concrete features, MoSCoW prioritized. |
| 03 | [Information Architecture](./docs/03-information-architecture.md) | Routes, navigation, entity model from a UX perspective. |
| 04 | [Layouts & Wireframes](./docs/04-layouts-wireframes.md) | ASCII wireframes for every primary view. |
| 05 | [AI Assistant Architecture](./docs/05-ai-assistant.md) | Vercel AI SDK v6+: Agents, useChat, transports, message parts, tools, citations, memory. |
| 06 | [Protocols, Biomarkers & Tracking](./docs/06-protocols-and-tracking.md) | The 7-layer time model → product. |
| 07 | [Gamification & Journey](./docs/07-gamification-journey.md) | "Becoming an Advanced Biohacker" XP system. |
| 08 | [Data Model Additions](./docs/08-data-model-additions.md) | New Prisma models the client requires. |
| 09 | [Tech Stack](./docs/09-tech-stack.md) | Next.js + Apollo + AI SDK + Workflow SDK + ai-elements + Tailwind/shadcn. |
| 10 | [Scope & Roadmap](./docs/10-scope-roadmap.md) | Phased delivery plan to a live Vercel deploy. |
| 11 | [Workflows & Durable Agents](./docs/11-workflows-and-durable-agents.md) | Workflow SDK for long-running tools, DurableAgent, resumable streams, HITL, observability. |
| 12 | [AI Elements UI Mapping](./docs/12-ai-elements-mapping.md) | Which `ai-elements` component renders which message part, with concrete usage. |

## TL;DR

- **Audience**: serious biohackers and longevity practitioners who want one workbench instead of 14 tabs.
- **Core loop**: *Explore → Save → Note → Build Protocol → Run It → Log Outcomes → Level Up*.
- **Differentiator**: a knowledge graph + a journey-aware, *durable* AI assistant + tight biomarker feedback loops, grounded in real claims from real episodes / case studies.
- **Stack**: Next.js 15 App Router on Vercel, **Clerk** for auth (`@clerk/nextjs`), Apollo Client, **Vercel AI SDK v6+** (`ai` `Agent` / `ToolLoopAgent`, `@ai-sdk/react` `useChat` v6), **Workflow SDK** (`workflow`, `@workflow/ai` `DurableAgent` + `WorkflowChatTransport`), **OpenAI** (`@ai-sdk/openai`) and **Amazon Bedrock** (`@ai-sdk/amazon-bedrock`) as the model providers, **Mem0** for assistant long-term memory, **Tavily** for web search (custom tool + optional MCP), **AI Elements** + shadcn/ui for chat UI, Tailwind, Postgres + pgvector via the existing GraphQL API.

## Quick rules of the road for this project

1. **Always check the live AI SDK source** in `node_modules/ai/` before writing AI code — APIs change. The `ai-sdk` and `ai-elements` skills in `.agents/skills/` carry the canonical patterns.
2. **Project override on the AI SDK skill.** The skill's defaults recommend Vercel AI Gateway and `provider/model-id` strings — **we don't use Gateway in this project.** Ignore `AI_GATEWAY_API_KEY`, ignore `gateway()`, ignore `curl https://ai-gateway.vercel.sh/v1/models`. Use the patterns in [09 — Tech Stack](./docs/09-tech-stack.md) and [05 — AI Assistant](./docs/05-ai-assistant.md) instead.
3. **Two model providers, called directly.** OpenAI via `OPENAI_API_KEY` (using `@ai-sdk/openai`) and Anthropic Claude via Amazon Bedrock with bearer-token auth (`AWS_BEARER_TOKEN_BEDROCK` + `AWS_REGION`, using `@ai-sdk/amazon-bedrock`). All model selection goes through `lib/ai/model.ts`'s `getModel(tier)` so swaps stay one-edit.
4. **Quick interactive turns → AI SDK Agent.** Long-running, retriable, observable, resumable work → **Workflow SDK `DurableAgent` + `"use step"` tools**.
5. **Web search = Tavily.** Wrapped in a `webResearch` tool (custom, using `@tavily/core`) inside a workflow. Optionally we can swap the implementation for the Tavily MCP server when it suits.
6. **Citations are mandatory.** Every assistant claim that came from a tool or source must render as an `InlineCitation` or `Sources` block linking back to the entity / URL.
7. **Reasoning, tool calls and sources must be inspectable.** Use the `Reasoning`, `ChainOfThought`, `Tool`, `Sources`, `Confirmation` ai-elements components — never silently merge tool output into prose.
8. **Auth = Clerk v7+.** No NextAuth, no `_app.tsx`, no pages router, no `<SignedIn>` / `<SignedOut>` (use `<Show when="signed-in">`). `clerkMiddleware()` lives in `middleware.ts` at the project root. Clerk v7 still detects `middleware.ts` specifically, not Next.js 15+'s newer `proxy.ts` rename — when Clerk updates, we'll rename.
9. **Long-term assistant memory = Mem0** (`MEM0_API_KEY`). The user's `Profile.longTermMemory` JSONB is gone — Mem0 owns that. Thread-summary memory still lives on `AssistantThread.memory`.
