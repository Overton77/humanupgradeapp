# 11 — Workflows & Durable Agents

> "Make any TypeScript function durable." — Vercel **Workflow SDK** ([workflow-sdk.dev](https://workflow-sdk.dev/)).

We use the Workflow SDK as the **durable execution layer** under the assistant and under the heavy server jobs. It is the difference between an app that *technically* works and one that survives page refreshes, network blips, deploys, rate limits, and 5-minute Tavily research sessions.

This doc explains:

1. When to reach for a workflow vs a regular tool / route handler.
2. The exact pattern we use for **durable AI agents**.
3. The exact pattern we use for **long-running tools called from the assistant**.
4. **Resumable streams** so the chat survives a refresh.
5. **Human-in-the-loop** hooks for protocol approval, dangerous deletions, etc.
6. Observability and how it slots into our existing recompute jobs.

---

## 1. Decision matrix — workflow or not?

| If the work is… | Pick |
|---|---|
| < 5 s, single tool call, no external API | Plain AI SDK tool (`"use step"` is unnecessary). |
| < 30 s, may hit rate limits, single tool call | Plain AI SDK tool with try/retry inside `execute`. |
| Multi-step, > 30 s, calls external APIs (Tavily, OpenAI, S3, lab APIs) | **Workflow + steps.** |
| Anything that must survive a page refresh | **Workflow + `WorkflowChatTransport`.** |
| Anything with human approval or external webhook | **Workflow + `defineHook` / `createWebhook`.** |
| Recurring (cron, scheduled) work | Vercel Cron handler that calls `start(...)`. |
| The whole assistant chat session itself | **Workflow** (durable agent, recommended for the side pane). |

Rule of thumb: if you would have reached for a queue, a worker, a retry loop, a status table, or a `setTimeout`-then-poll — use a workflow.

---

## 2. The two directives

```ts
// Workflow function — orchestrates steps. Sandbox: limited Node, deterministic.
export async function chatWorkflow(messages: ModelMessage[]) {
  'use workflow'
  // …
}

// Step function — does the actual work. Full Node.js runtime, auto-retried.
async function fetchEpisodeFromGraphQl(id: string) {
  'use step'
  // …
}
```

Both directives are picked up by `withWorkflow(nextConfig)` in `next.config.ts` (mandatory).

Two non-obvious rules from the docs we keep tripping over:

- `getWritable()`, `fetch()` (must be the workflow-provided one), `sleep()`, `createWebhook()`, `defineHook().create()` are **workflow-only**.
- Side-effect calls (DB, HTTP, S3, the GraphQL API) **must** live in steps. Workflows are deterministic; if you `await prisma.…()` from a workflow you'll get a runtime error.
- Step args/results are serialized — pass-by-value. Don't mutate inputs and expect the workflow to see it.

---

## 3. Repo layout for workflows

```
humanupgrade-client/
├── workflows/
│   ├── chat/
│   │   ├── workflow.ts             "use workflow" — DurableAgent run
│   │   ├── hooks/
│   │   │   ├── chat-message.ts     defineHook for follow-up messages (multi-turn)
│   │   │   └── proposal-approval.ts defineHook for protocol approval
│   │   └── steps/
│   │       ├── persist-thread.ts   "use step" — write AssistantThread/Message rows
│   │       ├── mem0-write.ts       "use step" — addMemory(...) after each assistant turn
│   │       └── writer.ts           "use step" — write data-* chunks
│   ├── analysis/
│   │   ├── deep-case-study.ts      "use workflow" — analyze a case study end-to-end
│   │   ├── verify-claim.ts         "use workflow" — find supporting + opposing evidence
│   │   ├── parse-lab-pdf.ts        "use workflow" — OCR + extract biomarker readings
│   │   └── steps/
│   │       ├── fetch-pdf.ts        "use step"
│   │       ├── extract-text.ts     "use step"
│   │       ├── tavily-search.ts    "use step"
│   │       ├── ai-extract.ts       "use step" — generateText with Output.array
│   │       └── persist-result.ts   "use step"
│   ├── recompute/
│   │   ├── recommendations.ts      "use workflow" — debounced per-user
│   │   ├── adherence.ts
│   │   └── biomarker-insights.ts
│   └── shared/
│       ├── prisma.ts               re-export wrapped for steps
│       └── env.ts
└── lib/
    └── tools/
        ├── deep-case-study-analysis.ts   AI SDK tool that start()s the workflow
        ├── verify-claim.ts
        ├── parse-lab-pdf.ts
        └── web-research.ts
```

---

## 4. Pattern A — DurableAgent for the chat session itself

This is what the side pane and full-screen surfaces use by default.

### Workflow

```ts
// workflows/chat/workflow.ts
import { DurableAgent } from '@workflow/ai/agent'
import { getWritable } from 'workflow'
import type { ModelMessage, UIMessageChunk } from 'ai'
import { humanUpgradeTools } from '@/lib/tools'
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt'
import { getModel } from '@/lib/ai/model'
import { persistAssistantTurn } from './steps/persist-thread'
import { writeUserTurnToMem0 } from './steps/mem0-write'

export async function chatWorkflow(input: {
  userId: string                 // local User.id (resolved from Clerk in the route handler)
  threadId: string
  messages: ModelMessage[]
}) {
  'use workflow'

  const writable = getWritable<UIMessageChunk>()

  const agent = new DurableAgent({
    // getModel returns either openai('gpt-5') or bedrock('anthropic.claude-sonnet-4-5-...').
    // DurableAgent accepts both string-form (gateway) and provider-call form. We use provider-call.
    model: getModel('balanced'),
    instructions: SYSTEM_PROMPT,
    tools: humanUpgradeTools,
  })

  const result = await agent.stream({ messages: input.messages, writable })

  // Fan out the persistence + memory writes as steps — free retries, no impact on stream latency.
  await persistAssistantTurn({ userId: input.userId, threadId: input.threadId, messages: result.messages })
  await writeUserTurnToMem0({ userId: input.userId, messages: result.messages })
}
```

What `DurableAgent` adds over plain `Agent`:

- Each LLM call and each tool call is a **durable step** — automatically retried, observable, persisted.
- Output is written to a **durable stream** that lives on the workflow run, not in-memory on the request.
- The workflow can be paused, resumed, and replayed safely.

### Route handler — start

```ts
// app/api/assistant/chat/route.ts
import { start } from 'workflow/api'
import { createUIMessageStreamResponse, convertToModelMessages } from 'ai'
import { chatWorkflow } from '@/workflows/chat/workflow'
import { requireUser } from '@/lib/auth'

export async function POST(req: Request) {
  const user = await requireUser()       // Clerk → local User row
  const { messages, threadId } = await req.json()
  const run = await start(chatWorkflow, [{
    userId: user.id,
    threadId,
    messages: await convertToModelMessages(messages),
  }])
  return createUIMessageStreamResponse({
    stream: run.readable,
    headers: { 'x-workflow-run-id': run.runId },
  })
}
```

### Route handler — reconnect to an existing stream

```ts
// app/api/assistant/chat/[runId]/stream/route.ts
import { createUIMessageStreamResponse } from 'ai'
import { getRun } from 'workflow/api'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params
  const url = new URL(req.url)
  const startIndex = url.searchParams.get('startIndex')

  const run = getRun(runId)
  const readable = run.getReadable({
    startIndex: startIndex ? parseInt(startIndex, 10) : undefined,
  })
  const tailIndex = await readable.getTailIndex()

  return createUIMessageStreamResponse({
    stream: readable,
    headers: { 'x-workflow-stream-tail-index': String(tailIndex) },
  })
}
```

### Client — `WorkflowChatTransport`

Drop-in transport for `useChat`, fully shown in [doc 05 §7](./05-ai-assistant.md#7-client--usechat-v6-with-attachments-and-reasoning). Notable bits:

- `onChatSendMessage` stores `runId` in localStorage keyed by `threadId`.
- `prepareReconnectToStreamRequest` builds the reconnect URL pointing at the per-runId GET endpoint.
- `initialStartIndex: -50` means on a hard refresh we only fetch the last 50 chunks rather than replaying the whole conversation — much faster UX.
- `onChatEnd` clears the runId so the next message starts a fresh run.

### Single-turn vs multi-turn workflow

For v1 we use **single-turn** (one workflow run per user message; client owns conversation history persisted to `AssistantThread` / `AssistantMessage`). It's simpler, slot-in, and matches our existing data model.

We earmark **multi-turn** (one workflow run for the whole session, follow-ups injected via `chatMessageHook.resume(runId, { message })`) for v1.1 when we want true session-scoped tool state (e.g. an analyst that keeps a working set of citations across turns), or multi-player chat sessions (system events / external webhooks pushing into the same conversation).

---

## 5. Pattern B — long-running tool wrapped as a workflow

This is the one users will *feel*. When a user asks **"do a deep analysis of this case study"** or **"verify this claim across the literature"**, we don't want to pin a Vercel function for 4 minutes — we kick off a workflow and stream progress back.

### The tool the assistant exposes

```ts
// lib/tools/deep-case-study-analysis.ts
import { tool, UIToolInvocation } from 'ai'
import { z } from 'zod'
import { start } from 'workflow/api'
import { deepCaseStudyAnalysisWorkflow } from '@/workflows/analysis/deep-case-study'
import { requireUserId } from '@/lib/auth'

export const deepCaseStudyAnalysis = tool({
  description: 'Run a deep, multi-step analysis of a case study: design, sample, methods, claims, contradictions, citations.',
  inputSchema: z.object({
    caseStudyId: z.string(),
    focus: z.enum(['DESIGN', 'METHODS', 'OUTCOMES', 'CONTRADICTIONS', 'ALL']).default('ALL'),
  }),
  execute: async ({ caseStudyId, focus }, { toolCallId }) => {
    const userId = await requireUserId()
    // Kick off — DON'T await completion. Return the run id so the UI can subscribe.
    const run = await start(deepCaseStudyAnalysisWorkflow, [{ userId, caseStudyId, focus, toolCallId }])
    return { status: 'started', runId: run.runId, toolCallId }
  },
})

export type DeepCaseStudyAnalysisInvocation = UIToolInvocation<typeof deepCaseStudyAnalysis>
```

The tool returns immediately — the assistant turn doesn't block. Progress comes back over the same chat stream (see §6).

### The workflow

```ts
// workflows/analysis/deep-case-study.ts
import { sleep, getWritable } from 'workflow'
import { generateText, Output, type UIMessageChunk } from 'ai'
import { getModel } from '@/lib/ai/model'
import { fetchCaseStudy } from './steps/fetch-case-study'
import { tavilySearch } from './steps/tavily-search'
import { extractClaims } from './steps/extract-claims'
import { persistAnalysis } from './steps/persist-analysis'

export async function deepCaseStudyAnalysisWorkflow(input: {
  userId: string
  caseStudyId: string
  focus: 'DESIGN' | 'METHODS' | 'OUTCOMES' | 'CONTRADICTIONS' | 'ALL'
  toolCallId: string
}) {
  'use workflow'

  const writable = getWritable<UIMessageChunk>()

  await emit(writable, { type: 'data-analysis-progress', id: input.toolCallId, data: { stage: 'fetching', pct: 5 } })
  const cs = await fetchCaseStudy(input.caseStudyId)

  await emit(writable, { type: 'data-analysis-progress', id: input.toolCallId, data: { stage: 'extracting-claims', pct: 25 } })
  const claims = await extractClaims(cs)

  await emit(writable, { type: 'data-analysis-progress', id: input.toolCallId, data: { stage: 'searching-corroboration', pct: 50 } })
  const evidence = await Promise.all(
    claims.map(c => tavilySearch({ query: c.text, max: 5 })),
  )

  await emit(writable, { type: 'data-analysis-progress', id: input.toolCallId, data: { stage: 'synthesizing', pct: 80 } })
  const report = await synthesize(cs, claims, evidence)

  await persistAnalysis({ userId: input.userId, caseStudyId: input.caseStudyId, report })

  await emit(writable, {
    type: 'data-analysis-result',
    id: input.toolCallId,
    data: { reportId: report.id, summary: report.summary, citations: report.citations },
  })
}

async function synthesize(...args: any[]) {
  'use step'
  const { text } = await generateText({
    // Reasoning-heavy synthesis → Claude Sonnet on Bedrock
    model: getModel('reasoning-heavy'),
    // …
  })
  return { id: crypto.randomUUID(), summary: text, citations: [] /* … */ }
}

async function emit(writable: WritableStream<UIMessageChunk>, chunk: UIMessageChunk) {
  'use step'
  const w = writable.getWriter()
  try { await w.write(chunk) } finally { w.releaseLock() }
}
```

### How the UI sees the progress

Because the tool started a workflow that writes to the **same chat stream** the assistant is using (via `getWritable()`), the chunks arrive as `data-analysis-progress` and `data-analysis-result` parts on the assistant message. We render them with a custom card:

```tsx
// components/assistant/tool-cards/DeepCaseStudyAnalysisCard.tsx
import type { HumanUpgradeUIMessage } from '@/lib/agents/humanupgrade-agent'
import type { DeepCaseStudyAnalysisInvocation } from '@/lib/tools/deep-case-study-analysis'
import { Artifact, ArtifactHeader, ArtifactTitle, ArtifactDescription, ArtifactActions, ArtifactAction, ArtifactContent } from '@/components/ai-elements/artifact'
import { Task, TaskTrigger, TaskContent, TaskItem } from '@/components/ai-elements/task'
import { useAssistantStreamData } from '@/hooks/useAssistantStreamData'

export function DeepCaseStudyAnalysisCard({ invocation }: { invocation: DeepCaseStudyAnalysisInvocation }) {
  const progress = useAssistantStreamData<{ stage: string, pct: number }>('data-analysis-progress', invocation.toolCallId)
  const result   = useAssistantStreamData<{ reportId: string, summary: string }>('data-analysis-result', invocation.toolCallId)

  const stages = ['fetching', 'extracting-claims', 'searching-corroboration', 'synthesizing']

  if (!result) {
    return (
      <Task defaultOpen>
        <TaskTrigger title="Deep case study analysis" />
        <TaskContent>
          {stages.map((s) => (
            <TaskItem
              key={s}
              status={progress?.stage === s ? 'active' : (stages.indexOf(s) < stages.indexOf(progress?.stage ?? 'fetching') ? 'complete' : 'pending')}
            >
              {labelFor(s)}
            </TaskItem>
          ))}
        </TaskContent>
      </Task>
    )
  }

  return (
    <Artifact>
      <ArtifactHeader>
        <ArtifactTitle>Analysis ready</ArtifactTitle>
        <ArtifactDescription>5 claims · 12 corroborating sources</ArtifactDescription>
        <ArtifactActions>
          <ArtifactAction icon={EyeIcon} label="Open report"  onClick={() => openReport(result.reportId)} />
          <ArtifactAction icon={SaveIcon} label="Save to library" onClick={() => save(result.reportId)} />
        </ArtifactActions>
      </ArtifactHeader>
      <ArtifactContent>
        <Streamdown>{result.summary}</Streamdown>
      </ArtifactContent>
    </Artifact>
  )
}
```

The `useAssistantStreamData(type, id)` helper just pulls the most recent matching part out of `useChat()`'s message parts, scoped by `id === toolCallId`.

### Why this matters

- The assistant's main turn returns in milliseconds (it just kicked off the run).
- The user sees granular progress — and can navigate away, come back, and see it complete.
- If Vercel times out the long polling, `WorkflowChatTransport` automatically reconnects and resumes from the last chunk.
- Failed steps are auto-retried up to 3 times before bubbling.
- Every step appears in the Workflow observability dashboard.

---

## 6. Pattern C — Human-in-the-loop confirmation

When the assistant proposes something destructive or significant (delete a protocol, save a generated long-form note, send an email later), we want explicit human approval.

### Define the hook

```ts
// workflows/chat/hooks/proposal-approval.ts
import { defineHook } from 'workflow'
import { z } from 'zod'

export const proposalApprovalHook = defineHook({
  schema: z.object({
    approved: z.boolean(),
    edits: z.record(z.string(), z.unknown()).optional(),
    comment: z.string().optional(),
  }),
})
```

### The tool that pauses for approval (NO `"use step"` — hook lives in workflow context)

```ts
// inside a workflow tool
async function proposeProtocolForApproval(
  input: ProposedProtocol,
  { toolCallId }: { toolCallId: string },
) {
  // No "use step" — hooks are workflow-level
  const hook = proposalApprovalHook.create({ token: toolCallId })
  const { approved, edits, comment } = await hook
  if (!approved) return { status: 'rejected', comment }
  return persistProtocol({ ...input, ...edits })
}

async function persistProtocol(p: ProposedProtocol) { 'use step'; /* … */ }
```

### The API the UI calls when the user clicks "Approve"

```ts
// app/api/assistant/hooks/proposal-approval/route.ts
import { proposalApprovalHook } from '@/workflows/chat/hooks/proposal-approval'

export async function POST(req: Request) {
  const { toolCallId, approved, edits, comment } = await req.json()
  await proposalApprovalHook.resume(toolCallId, { approved, edits, comment })
  return Response.json({ ok: true })
}
```

### The UI

We render the pending tool with the `Confirmation` ai-element:

```tsx
case 'tool-proposeProtocolForApproval': {
  if (part.state === 'output-available') {
    return part.output.status === 'rejected'
      ? <ConfirmationRejected>{part.output.comment}</ConfirmationRejected>
      : <ConfirmationAccepted>Protocol saved</ConfirmationAccepted>
  }
  return (
    <Confirmation>
      <ConfirmationTitle>Save this protocol?</ConfirmationTitle>
      <ConfirmationRequest>
        <ProposedProtocolPreview proto={part.input} />
      </ConfirmationRequest>
      <ConfirmationActions>
        <ConfirmationAction onClick={() => approve(part.toolCallId)}>Save</ConfirmationAction>
        <ConfirmationAction variant="destructive" onClick={() => reject(part.toolCallId)}>Discard</ConfirmationAction>
      </ConfirmationActions>
    </Confirmation>
  )
}
```

For external systems (e.g. email approval), use `createWebhook()` instead of `defineHook()` and email the URL out.

---

## 7. Streaming progress from inside a tool

For shorter tools where we still want richer feedback than a spinner, a `"use step"` can write `data-*` chunks directly. From the workflow docs:

```ts
// workflows/analysis/steps/tavily-search.ts
import { getWritable } from 'workflow'
import type { UIMessageChunk } from 'ai'
import { tavily } from '@tavily/core'

const client = tavily({ apiKey: process.env.TAVILY_API_KEY! })

export async function tavilySearch(
  args: { query: string, max?: number, depth?: 'basic' | 'advanced' },
  { toolCallId }: { toolCallId: string },
) {
  'use step'

  const writable = getWritable<UIMessageChunk>()
  const writer = writable.getWriter()
  try {
    await writer.write({
      type: 'data-tavily-progress', id: toolCallId,
      data: { phase: 'querying', q: args.query },
    })

    const res = await client.search(args.query, {
      searchDepth: args.depth ?? 'advanced',
      maxResults: args.max ?? 5,
      includeAnswer: 'advanced',
    })

    for (const r of res.results) {
      await writer.write({
        type: 'data-tavily-result', id: toolCallId,
        data: { url: r.url, title: r.title, snippet: r.content, score: r.score },
      })
    }

    await writer.write({
      type: 'data-tavily-progress', id: toolCallId,
      data: { phase: 'done', count: res.results.length },
    })

    return { answer: res.answer, results: res.results }
  } finally {
    writer.releaseLock()
  }
}
```

The client renders these as a live-updating list — see `ChainOfThought` or a custom `Task` list with `TaskItem` per URL.

> **Tavily MCP alternative.** Instead of writing this step ourselves, we can register Tavily's hosted MCP server with the AI SDK and let the model pick from `tavily_search` / `tavily_extract` / `tavily_crawl` dynamically. v1 uses the direct SDK above (predictable cost, tight workflow integration). We'll consider MCP in v1.1 if we want autonomous tool selection.

---

## 8. Specific HumanUpgrade workflows we will ship

These are the workflows that earn their keep on day one.

| Workflow | Trigger | Steps | Output |
|---|---|---|---|
| `chatWorkflow` | every assistant turn (side pane / full screen) | DurableAgent stream → `persistAssistantTurn` step → `writeUserTurnToMem0` step | UI message stream + Mem0 facts written for next turn |
| `deepCaseStudyAnalysisWorkflow` | tool `deepCaseStudyAnalysis` | fetch CS → extract claims → Tavily corroborate per claim → synthesize → persist `Analysis` | streamed progress + `Artifact` |
| `verifyClaimWorkflow` | tool `verifyClaim` (also via right-click on any Claim chip) | search internal evidence → Tavily / PubMed search → classify supports/opposes/mixed → write `ClaimVerification` row | streamed `ChainOfThought` + `Sources` |
| `webResearchWorkflow` | tool `webResearch(query)` | Tavily search → fetch top N → summarize → return citations | streamed `Source` per result + final `MessageResponse` |
| `parseLabPdfWorkflow` | upload of a lab PDF | S3 download → OCR (`pdf-parse` + Tesseract fallback) → biomarker extract via `Output.array(BiomarkerReading)` → `Confirmation` per row → persist | `Confirmation` cards + summary |
| `protocolGenerationWorkflow` | tool `proposeProtocol` when user asks for "an 8-week plan" | gather context → `Output.object(Protocol)` → HITL approval → persist + link biomarkers | `Artifact` |
| `recomputeRecommendationsWorkflow(userId)` | debounced 30 s after any save / log / protocol mutation | rank entities against profile + activity vector | writes `RecommendationCache` |
| `recomputeBiomarkerInsightsWorkflow(userBiomarkerId)` | on new reading | rolling stats + correlation with active steps | writes `BiomarkerInsight` |
| `digestWeeklyWorkflow(userId)` | Sunday cron | aggregate streaks, adherence, trends → email via Resend | email |

The recompute / digest workflows replace the `waitUntil(...)` pattern from the original tech stack doc — they're more robust and observable.

---

## 9. Wiring into Next.js

`next.config.ts`:

```ts
import { withWorkflow } from 'workflow/next'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = { /* … */ }
export default withWorkflow(nextConfig)
```

`tsconfig.json` — add the workflow IntelliSense plugin so the directives get hinted:

```jsonc
{
  "compilerOptions": {
    "plugins": [{ "name": "workflow" }]
  }
}
```

Middleware (if any) must skip the workflow's internal namespace:

```ts
export const config = {
  matcher: [{ source: '/((?!_next/static|_next/image|favicon.ico|.well-known/workflow/).*)' }],
}
```

Local observability: `npx workflow web` opens a dashboard that lists every run with traces. On Vercel, the dashboard is built-in.

---

## 10. Errors, retries, idempotency

- A step throws a normal `Error` → retried up to 3 times with backoff.
- A step throws `RetryableError("rate limited", { retryAfter: '1m' })` → respected.
- A step throws `FatalError(...)` → bubbles immediately, no retry.
- All step inputs are serialized — assume strict JSON. Don't pass class instances or functions.
- Steps must be **idempotent** (the workflow will replay them if the workflow is re-run from the event log). Keep DB writes upsert-shaped where possible. The Workflow SDK provides idempotency primitives — use them for create-only writes.

---

## 11. Observability + cost

- Workflow dashboard surfaces every run, every step, every retry, every payload. It's the operational view.
- We mirror **AI cost** (input/output tokens, model, latency, USD) into `AssistantMessage` via the AI SDK telemetry hooks — that's our user-facing cost view.
- Per-user **token budget** middleware sits in front of `start(chatWorkflow, …)`; when over budget we fail-fast with a `FatalError` before consuming the model call.

---

## 12. Migration from earlier doc

The original tech stack doc proposed `Vercel Cron + waitUntil() + Postgres queue table` for background work. We're upgrading that to **Workflow SDK** end-to-end:

- `waitUntil(recomputeX(...))` → `start(recomputeXWorkflow, [...])` (returns immediately, runs durably).
- Cron jobs trigger workflow `start(...)` calls.
- The Postgres queue table goes away — Workflow's event log replaces it.

This is a strict net improvement: free retries, free observability, free resumability, no new services to operate (Workflow is built into Vercel).
