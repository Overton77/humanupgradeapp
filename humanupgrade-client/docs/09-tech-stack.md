# 09 — Tech Stack

A boring, deploy-on-Vercel-tomorrow stack. Every choice is justified. The AI / durability layer is opinionated and modern — we lean **all in** on Vercel's open-source AI stack (AI SDK v6+, AI Elements, Workflow SDK) because the marginal cost of mixing is high and the marginal benefit is zero. We deliberately **skip Vercel's hosted AI Gateway** and call OpenAI + Amazon Bedrock directly — see "Model providers" below.

## Stack summary

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 15+ (App Router)** | RSC for entity pages, route handlers for streaming, Vercel-native. |
| Language | **TypeScript (strict)** | Already used by the API; shared types via codegen + `InferAgentUIMessage`. |
| Hosting | **Vercel** | Same as the API; preview deploys per PR; built-in observability for AI + Workflow. |
| Auth | **Clerk** (`@clerk/nextjs`) | Hosted auth + UI components (`<UserButton>`, `<SignInButton>`, `<SignUpButton>`, `<Show>`); `clerkMiddleware()` in `proxy.ts`; `auth()` helper in server code. No password storage on us, no session table. |
| Data (knowledge graph) | **Apollo Client + GraphQL Codegen** | Existing API is GraphQL; SSR + RSC compatible. |
| Data (user-owned) | **Prisma direct from server actions / route handlers / steps** | New user models live in same DB; we don't need GraphQL for our own writes. |
| AI core | **Vercel AI SDK v6+** (`ai`) | `Agent` / `ToolLoopAgent`, `streamText`, tool calling, `Output.object/array/choice`, telemetry. |
| AI client | **`@ai-sdk/react`** | `useChat` v6 (manual `input` + `sendMessage` + `addToolOutput`). |
| AI providers | **OpenAI** (`@ai-sdk/openai`, `OPENAI_API_KEY`) and **Anthropic Claude on Amazon Bedrock** (`@ai-sdk/amazon-bedrock`, `AWS_BEARER_TOKEN_BEDROCK` + `AWS_REGION`) | Direct providers, no gateway. All access funneled through `lib/ai/model.ts`'s `getModel(tier)` helper. |
| AI UI components | **`ai-elements`** (shadcn-registry style) | Owned-in-repo Reasoning, Tool, Sources, Confirmation, Artifact, Task, ChainOfThought, PromptInput, etc. |
| Durable execution | **Vercel Workflow SDK** (`workflow`, `@workflow/ai`) | `DurableAgent`, `WorkflowChatTransport`, resumable streams, HITL hooks, observability. |
| RAG | Existing **pgvector** embeddings on the API + new embeddings on `Note` & `Highlight` | Reuse infra; no new vector DB. |
| External web search | **Tavily** (`@tavily/core`) wrapped in a `"use step"` | Inside `webResearch` / `verifyClaim` / `deepCaseStudyAnalysis` workflows. Tavily MCP available as a v1.1 alternative for autonomous tool selection. |
| Long-term assistant memory | **Mem0** (`mem0ai`) | Persistent, queryable user memory across threads. Replaces a hand-rolled `longTermMemory` JSONB field. |
| Markdown rendering | **Streamdown** (bundled with `ai-elements`) | Streams markdown safely; handles partial code blocks. |
| UI primitives | **Tailwind CSS v4 + shadcn/ui + Radix** | AI Elements requires this; same primitives across the app. |
| State | **Zustand** for ephemeral UI (panes, drag state); **Apollo cache** for graph; **`useChat`** for conversations | No Redux. |
| Forms | **React Hook Form + Zod** | Match the API's existing Zod-based validation. |
| Charts | **Recharts** for biomarkers + adherence | Familiar API; SSR-safe. |
| PDF preview | **react-pdf** | Highlightable. Parse via `pdf-parse` inside a `"use step"`. |
| Drag & drop | **@dnd-kit/core** | Pane → composer, between panes. |
| Resizable panes | **react-resizable-panels** | Persisted ratios, mobile fallback. |
| Files | **Vercel Blob** (preferred) or **AWS S3** | The API already touches S3; Blob is closer-to-home. |
| Background jobs | **Workflow SDK + Vercel Cron** | Crons call `start(workflow, [...])`. No separate queue infra. |
| Rate limiting | **Upstash Redis + `@upstash/ratelimit`** | Edge-compatible. |
| Observability | **Vercel Workflow dashboard** + **AI SDK telemetry** + **Vercel Analytics** | Trace AI + workflow runs end-to-end out of the box. |
| Email | **Resend** | Magic links, opt-in digests. |
| Testing | **Vitest** (unit), **Playwright** (e2e), **`@workflow/vitest`** for workflow tests, **MSW** for Apollo mocks | Aligns with API. |
| Lint/format | **ESLint flat config + Prettier + TypeScript ESLint** | Standard. |
| Package manager | **pnpm** (workspace, matching the API repo) | Already in use. |

---

## `package.json` core dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",

    "ai": "^6.0.34",
    "@ai-sdk/react": "^2.0.0",
    "@ai-sdk/openai": "^2.0.0",
    "@ai-sdk/amazon-bedrock": "^2.0.0",

    "workflow": "latest",
    "@workflow/ai": "latest",

    "@tavily/core": "^0.5.0",

    "@apollo/client": "^3.13.0",
    "@apollo/client-integration-nextjs": "^0.12.0",

    "@clerk/nextjs": "latest",
    "@prisma/client": "^5.0.0",

    "mem0ai": "latest",

    "zod": "^3.23.0",
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "^3.0.0",

    "tailwindcss": "^4.0.0",
    "lucide-react": "^0.470.0",
    "react-resizable-panels": "^2.0.0",
    "@dnd-kit/core": "^6.0.0",
    "recharts": "^2.0.0",
    "react-pdf": "^9.0.0",
    "pdf-parse": "^1.0.0",

    "@upstash/redis": "^1.0.0",
    "@upstash/ratelimit": "^2.0.0",
    "resend": "^4.0.0",

    "@vercel/blob": "^0.0.0",

    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "prisma": "^5.0.0",
    "@graphql-codegen/cli": "^5.0.0",
    "@graphql-codegen/client-preset": "^4.0.0",
    "vitest": "^2.0.0",
    "@workflow/vitest": "latest",
    "@playwright/test": "^1.0.0",
    "eslint": "^9.0.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest",
    "test:e2e": "playwright test",
    "workflow:web": "workflow web",
    "workflow:inspect": "workflow inspect runs",
    "ai-elements": "pnpm dlx ai-elements@latest"
  }
}
```

> Always pin AI SDK / Workflow SDK to whatever's current at install time — the skills explicitly say to fetch the latest. Don't trust this list's exact versions.

---

## Repo layout

```
humanupgradeapp/
├── humanupgradeapi/                (existing GraphQL server)
└── humanupgrade-client/
    ├── docs/                       ← these documents
    ├── .agents/skills/             ← ai-sdk + ai-elements skill packs
    ├── app/                        ← Next.js App Router
    │   ├── (marketing)/
    │   ├── (auth)/
    │   ├── (app)/                  ← gated layout with workbench shell
    │   │   ├── layout.tsx
    │   │   ├── page.tsx            ← workbench home
    │   │   ├── library/
    │   │   ├── track/
    │   │   ├── protocols/
    │   │   ├── journey/
    │   │   ├── profile/
    │   │   └── e/                  ← public entity pages
    │   ├── api/
    │   │   ├── webhooks/clerk/route.ts            ← Clerk → upsert local User row
    │   │   ├── assistant/
    │   │   │   ├── chat/
    │   │   │   │   ├── route.ts                    POST → start(chatWorkflow)
    │   │   │   │   └── [runId]/stream/route.ts     GET  → reconnect to run stream
    │   │   │   ├── quick-ask/route.ts              POST → ToolLoopAgent (interactive)
    │   │   │   ├── suggestions/route.ts            GET  → small Output.array call, cached
    │   │   │   └── hooks/
    │   │   │       ├── proposal-approval/route.ts
    │   │   │       └── lab-readings-approval/route.ts
    │   │   ├── files/upload/route.ts
    │   │   ├── cron/
    │   │   │   ├── trending/route.ts               → start(recomputeTrendingWorkflow)
    │   │   │   └── digest/route.ts                 → start(weeklyDigestWorkflow)
    │   │   └── webhooks/                           ← stripe, oura, etc. (later)
    │   └── globals.css
    ├── components/
    │   ├── ai-elements/             ← installed via `pnpm dlx ai-elements@latest add ...`
    │   ├── workbench/
    │   ├── entity/                  ← reusable entity cards, relation rails
    │   ├── assistant/
    │   │   ├── AssistantPane.tsx
    │   │   ├── QuickAskPalette.tsx
    │   │   └── tool-cards/
    │   │       ├── SearchEntitiesCard.tsx
    │   │       ├── EntityPreviewCard.tsx
    │   │       ├── ProposeProtocolCard.tsx
    │   │       ├── DeepCaseStudyAnalysisCard.tsx
    │   │       ├── ClaimVerificationCard.tsx
    │   │       ├── WebResearchCard.tsx
    │   │       └── LabReadingsApprovalCard.tsx
    │   ├── protocols/
    │   ├── biomarkers/
    │   └── ui/                      ← shadcn primitives
    ├── lib/
    │   ├── apollo/
    │   ├── auth/                    ← Clerk wrappers: requireUser(), requireUserId(), getUserOrNull()
    │   ├── memory/                  ← Mem0 client wrapper: addMemory, searchMemory, listMemories, deleteMemory
    │   ├── ai/
    │   │   ├── system-prompt.ts
    │   │   ├── context.ts           ← buildContextEnvelope (loads Mem0 facts)
    │   │   ├── data-parts.ts        ← typed data-* registry
    │   │   └── model.ts             ← getModel(tier) — OpenAI + Bedrock providers
    │   ├── agents/
    │   │   └── humanupgrade-agent.ts ← ToolLoopAgent + InferAgentUIMessage
    │   ├── tools/                   ← one file per tool (ai-sdk skill convention)
    │   │   ├── search-entities.ts
    │   │   ├── get-entity.ts
    │   │   ├── save-entity.ts
    │   │   ├── notes.ts
    │   │   ├── highlights.ts
    │   │   ├── protocols.ts
    │   │   ├── biomarkers.ts
    │   │   ├── xp.ts
    │   │   ├── deep-case-study-analysis.ts   ← starts a workflow
    │   │   ├── verify-claim.ts               ← starts a workflow
    │   │   ├── web-research.ts               ← starts a workflow
    │   │   └── parse-lab-pdf.ts              ← starts a workflow
    │   ├── gql/                     ← codegen output
    │   ├── rag/                     ← retrieval helpers using pgvector
    │   └── utils/
    ├── workflows/                   ← see doc 11
    │   ├── chat/
    │   │   ├── workflow.ts
    │   │   ├── hooks/
    │   │   └── steps/
    │   ├── analysis/
    │   │   ├── deep-case-study.ts
    │   │   ├── verify-claim.ts
    │   │   ├── parse-lab-pdf.ts
    │   │   └── steps/
    │   ├── recompute/
    │   │   ├── recommendations.ts
    │   │   ├── trending.ts
    │   │   ├── adherence.ts
    │   │   └── biomarker-insights.ts
    │   └── shared/
    ├── hooks/
    ├── stores/                     ← zustand
    ├── public/
    ├── tests/
    ├── codegen.ts
    ├── next.config.ts              ← `withWorkflow(nextConfig)`
    ├── proxy.ts                    ← Clerk middleware (Next 15+ rename of middleware.ts)
    ├── tailwind.config.ts
    ├── components.json             ← shadcn config (also used by ai-elements)
    ├── tsconfig.json               ← `plugins: [{"name":"workflow"}]`
    └── package.json
```

> **`proxy.ts` not `middleware.ts`** — Next.js 15+ renamed the project-root middleware file. Both Clerk and the Workflow SDK respect the new name; we only need a single `proxy.ts` that combines `clerkMiddleware()` with the Workflow SDK matcher exclusion.

---

## Key implementation notes

### `next.config.ts` — must wrap with `withWorkflow`

```ts
import { withWorkflow } from 'workflow/next'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: { typedRoutes: true },
}
export default withWorkflow(nextConfig)
```

### `tsconfig.json` — workflow IntelliSense

```jsonc
{
  "compilerOptions": {
    "plugins": [{ "name": "workflow" }],
    "paths": { "@/*": ["./*"] }
  }
}
```

### Auth — Clerk

`proxy.ts` (project root) — combines Clerk middleware with the Workflow SDK exclusion:

```ts
// proxy.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals, static assets, AND Workflow SDK's well-known paths.
    '/((?!_next|.well-known/workflow|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

`app/layout.tsx` — `<ClerkProvider>` wraps everything inside `<body>`:

```tsx
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
```

Auth helpers we use everywhere:

```ts
// lib/auth/index.ts
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * For server actions / route handlers / workflow-tool execute().
 * Throws if the request is not signed in. Returns the local User row,
 * upserting from Clerk if first-time-seen.
 */
export async function requireUser() {
  const { userId } = await auth()
  if (!userId) throw new Response('Unauthorized', { status: 401 })

  // Lazy-mirror Clerk → local User. Webhook keeps it fresh; this catches first-touch.
  let user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) {
    const cu = await currentUser()
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: cu?.primaryEmailAddress?.emailAddress ?? '',
        name: cu?.fullName ?? null,
        image: cu?.imageUrl ?? null,
      },
    })
  }
  return user
}

export async function requireUserId() {
  const { userId } = await auth()
  if (!userId) throw new Response('Unauthorized', { status: 401 })
  return (await requireUser()).id   // local Prisma id, not Clerk id
}

export async function getUserOrNull() {
  const { userId } = await auth()
  if (!userId) return null
  return prisma.user.findUnique({ where: { clerkId: userId } })
}
```

Clerk webhook (`app/api/webhooks/clerk/route.ts`) listens for `user.created`, `user.updated`, `user.deleted` and keeps the local `User` row in sync. The local `User` carries the **internal id** that all our other tables (`Note`, `Protocol`, `BiomarkerReading`, …) FK to — Clerk's `userId` is stored as `clerkId String @unique` on `User`.

Client-side gating uses Clerk's components — never `<SignedIn>` / `<SignedOut>` (deprecated):

```tsx
import { Show, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'

<header>
  <Show when="signed-out">
    <SignInButton mode="modal" />
    <SignUpButton mode="modal" />
  </Show>
  <Show when="signed-in">
    <UserButton afterSignOutUrl="/" />
  </Show>
</header>
```

Route gating happens automatically via the matcher in `proxy.ts` plus per-route `auth.protect()` calls when needed (RSC pages can call `await auth.protect()` to force a redirect to the sign-in URL).

### Mem0 — long-term assistant memory

Wrapper in `lib/memory/mem0.ts`:

```ts
// lib/memory/mem0.ts
import { MemoryClient } from 'mem0ai'

const client = new MemoryClient({ apiKey: process.env.MEM0_API_KEY! })

// Mem0 scopes memories by user_id — we use our local User.id (NOT Clerk's id).
export async function addMemory(opts: { userId: string, messages: { role: 'user' | 'assistant', content: string }[], metadata?: Record<string, unknown> }) {
  return client.add(opts.messages, { user_id: opts.userId, metadata: opts.metadata })
}

export async function searchMemory(opts: { userId: string, query: string, limit?: number }) {
  return client.search(opts.query, { user_id: opts.userId, limit: opts.limit ?? 5 })
}

export async function listMemories(userId: string) {
  return client.getAll({ user_id: userId })
}

export async function deleteMemory(memoryId: string) {
  return client.delete(memoryId)
}
```

How we use it:

- **Read** (every assistant turn): `buildContextEnvelope` calls `searchMemory({ userId, query: lastUserText })` and includes the top-K relevant facts in the system addendum.
- **Write** (after each assistant turn): a `"use step"` calls `addMemory({ userId, messages: [last user, last assistant] })` so Mem0 can extract atomic facts. Mem0 handles dedup, contradiction, decay.
- **List / edit / delete** (Settings → Memory): the user sees every memory, can pin / edit / delete via Clerk-protected route handlers.

This replaces the `UserProfile.longTermMemory Json?` field (now removed from the schema — see [doc 08](./08-data-model-additions.md)).

### Apollo + RSC

- Use `@apollo/client-integration-nextjs` (`registerApolloClient`) so RSC components can fetch via the same client.
- Mutations and subscriptions stay in client components.
- Codegen generates typed query hooks + RSC fetchers from `.graphql` files colocated with components.

### Model providers

Two providers, both accessed directly. All resolution lives in `lib/ai/model.ts`:

```ts
// lib/ai/model.ts
import { openai } from '@ai-sdk/openai'
import { bedrock } from '@ai-sdk/amazon-bedrock'

export type ModelTier = 'reasoning-heavy' | 'balanced' | 'fast' | 'embedding'

export function getModel(tier: ModelTier) {
  switch (tier) {
    case 'reasoning-heavy':
      return bedrock('anthropic.claude-sonnet-4-5-20250929-v1:0')
    case 'balanced':
      return openai('gpt-5')
    case 'fast':
      return openai('gpt-5-mini')
    case 'embedding':
      return openai.embedding('text-embedding-3-large')
  }
}
```

- **OpenAI** — `OPENAI_API_KEY` only; `@ai-sdk/openai` reads it. Verify available models at [platform.openai.com/docs/models](https://platform.openai.com/docs/models) before pinning.
- **Bedrock** — `AWS_BEARER_TOKEN_BEDROCK` + `AWS_REGION`. The bearer-token form is the modern, serverless-friendly auth (no SigV4 dance). **You must explicitly enable each Anthropic model in the Bedrock console for the chosen region** before the SDK can call it. List models you have access to with:

```bash
aws bedrock list-foundation-models --by-provider anthropic --region $AWS_REGION \
  | jq -r '.modelSummaries[] | .modelId'
```

> Per-thread overrides go through `getModel(thread.modelTier)` — never hardcode model IDs outside `lib/ai/model.ts`. This is the single seam for cost optimization, A/B tests, and provider migration.

### Background recompute via Workflow SDK

Replace `waitUntil(...)` with `start(...)`:

```ts
// inside a server action / route handler that mutates user data:
import { start } from 'workflow/api'
import { recomputeRecommendationsWorkflow } from '@/workflows/recompute/recommendations'
import { recomputeAdherenceWorkflow } from '@/workflows/recompute/adherence'

await start(recomputeRecommendationsWorkflow, [{ userId }])
await start(recomputeAdherenceWorkflow, [{ protocolId }])
```

Vercel Cron handlers in `app/api/cron/*/route.ts` do the same — they're just authenticated `GET`s that `start()` a workflow and return.

### Rate limiting

```ts
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const aiTurnLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  prefix: 'rl:ai:turn',
})

export const aiTokenBudget = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.tokenBucket(150_000, '1 d', 150_000),
  prefix: 'rl:ai:tokens',
})
```

Wrap the assistant route with both. `aiTokenBudget.limit(userId, tokensEstimate)` is consumed *before* starting the workflow.

### Pane persistence

```ts
const [layout, setLayout] = usePersistentLayout(routeKey, {
  defaults: [22, 56, 22],
  min: [12, 40, 16],
})
```

Reads from local storage instantly, syncs to `PaneLayout` table debounced 800 ms.

### Drag & drop contract

A draggable item declares `{ kind, ref }`. The assistant `PromptInput` is a custom drop target that converts in-app drags into `attached` items in the next `sendMessage({ … metadata: { attached } })` call. File drops continue to use AI Elements' `Attachments` mechanism.

---

## Environment variables

```
NODE_ENV=development

# GraphQL API
NEXT_PUBLIC_GRAPHQL_URL=https://api.humanupgrade.app/graphql

# Database (shared with the API)
DATABASE_URL=

# Auth — Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SIGNING_SECRET=          # for app/api/webhooks/clerk/route.ts

# Email
RESEND_API_KEY=

# AI providers
OPENAI_API_KEY=
AWS_BEARER_TOKEN_BEDROCK=              # Bedrock bearer-token auth (preferred over IAM keys for serverless)
AWS_REGION=us-east-1                   # Region where the Anthropic models are enabled in your Bedrock account
BEDROCK_EMBEDDING_MODEL_ID=            # primary, e.g. amazon.titan-embed-text-v2:0
BEDROCK_EMBEDDING_MODEL_ID_FALLBACK=   # fallback if the primary is unavailable

# OpenAI extras
OPENAI_HUMAN_UPGRADE_VECTOR_STORE_ID=  # existing OpenAI vector store; used for ad-hoc retrieval where pgvector isn't ideal

# Long-term assistant memory
MEM0_API_KEY=

# Web search
TAVILY_API_KEY=

# Files / Storage
BLOB_READ_WRITE_TOKEN=                 # Vercel Blob (preferred)

# Rate limiting + caches
UPSTASH_API_KEY=                       # Upstash management; for Redis/ratelimit also set the REST URL/token below
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

The Workflow SDK on Vercel needs **no extra env vars** — it ships with the platform.

---

## CI / preview deploys

- Push → Vercel preview (per PR).
- `pnpm test` (Vitest, includes `@workflow/vitest`) + `pnpm lint` + `pnpm typecheck` blocking checks on PR.
- `pnpm test:e2e` (Playwright) runs nightly on `main`.
- Prisma migrations gated behind a `pnpm migrate:deploy` step that runs only on production deploys.

---

## What we are explicitly NOT picking (yet)

- ❌ tRPC — we already have GraphQL.
- ❌ Server-Sent-Events directly — the AI SDK + Workflow SDK give us better streaming primitives.
- ❌ React Query — Apollo cache is sufficient for our data access.
- ❌ A separate vector DB — pgvector is fine until we hit > 10M embeddings.
- ❌ A separate queue / worker service — Workflow SDK is the queue + worker + retry + observability layer.
- ❌ Microservices — single Next.js app + single GraphQL API + Postgres + Workflow runtime. Boring on purpose.
