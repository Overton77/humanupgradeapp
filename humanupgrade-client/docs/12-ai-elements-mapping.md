# 12 — AI Elements UI Mapping

> [`ai-elements`](https://www.npmjs.com/package/ai-elements) is the official shadcn/ui-based component registry for AI chat UIs. Every component lives **inside our codebase** under `components/ai-elements/` once installed via `pnpm dlx ai-elements@latest add <name>`, so we own and customize it.

This doc is the **part-type → component mapping**: given an `ai-sdk` UI message part, which component renders it, and what props we pass.

---

## 1. Setup

Install AI Elements (auto-installs shadcn/ui + tailwind config if missing):

```bash
pnpm dlx ai-elements@latest
```

Then add per-component as needed:

```bash
pnpm dlx ai-elements@latest add conversation message prompt-input \
  reasoning chain-of-thought tool sources inline-citation \
  task plan artifact confirmation suggestion attachments \
  open-in-chat model-selector
```

Components land in `components/ai-elements/`. The defaults are good; tweak Tailwind classes inline rather than overriding upstream.

---

## 2. The full mapping

| `UIMessage.parts[i].type` | Component(s) | When to use it |
|---|---|---|
| `text` | `MessageResponse` (assistant) / plain text (user) | All free-form prose. Renders markdown via Streamdown. |
| `reasoning` | `Reasoning` + `ReasoningTrigger` + `ReasoningContent` | Single block of thinking from a reasoning model. Auto-opens while streaming, collapses when done. **Server must pass `sendReasoning: true` to `toUIMessageStreamResponse()`.** |
| `source-url` | `Sources` + `SourcesTrigger` + `SourcesContent` + `Source` | Web sources emitted by the model (Tavily, Perplexity Sonar, GPT web search). Render the `Sources` block ABOVE the assistant `MessageContent`. |
| `file` | `Attachments` + `Attachment` + `AttachmentPreview` | Images / files included in assistant output. |
| `tool-{toolName}` | Per-tool custom card OR generic `Tool` + `ToolHeader` + `ToolInput` + `ToolOutput` | One match per registered tool. Generic fallback when we haven't built a bespoke card. |
| `tool-{toolName}` with `state === 'approval-requested'` | `Confirmation` + `ConfirmationActions` + `ConfirmationAction` | HITL flow — call `addToolOutput({ tool, toolCallId, output })` on accept/reject. |
| `tool-{toolName}` for protocol/analysis output | `Artifact` + `ArtifactHeader` + `ArtifactActions` + `ArtifactContent` | Generated artifacts the user wants to keep — protocol drafts, analysis reports, summaries. |
| `data-*` (e.g. `data-analysis-progress`, `data-tavily-result`) | `Task` + `TaskItem` (linear), `ChainOfThought` (reasoning trace), or custom | Streaming progress from a tool / step (see [doc 11 §7](./11-workflows-and-durable-agents.md#7-streaming-progress-from-inside-a-tool)). |

For **inline citations inside the assistant's prose** (`[¹]`-style chips), we post-process `text` parts client-side: scan for citation markers we put in via the system prompt + tool grounding, and wrap them in `InlineCitation` + `InlineCitationCard` pointing at the entity URL or external URL.

---

## 3. Component cheat-sheet

### `Conversation` + `Message` — the message shell

```tsx
<Conversation>
  <ConversationContent>
    {messages.map(m => (
      <Message from={m.role} key={m.id}>
        <MessageContent>{ /* parts… */ }</MessageContent>
      </Message>
    ))}
  </ConversationContent>
  <ConversationScrollButton />
</Conversation>
```

### `Reasoning` — collapsible thinking

```tsx
<Reasoning isStreaming={isLast && isStreaming && lastPart.type === 'reasoning'}>
  <ReasoningTrigger />
  <ReasoningContent>{reasoningText}</ReasoningContent>
</Reasoning>
```

If a model returns multiple `reasoning` parts (GPT-5 reasoning effort = high), concat them into one block — we already do this in [doc 05 §7](./05-ai-assistant.md#7-client--usechat-v6-with-attachments-and-reasoning).

### `ChainOfThought` — labeled reasoning steps

For **our** custom workflows where we control the labels (e.g. *deep case-study analysis*: fetching → extracting → corroborating → synthesizing), use `ChainOfThought` instead of `Reasoning`. It's driven by `data-*` parts.

```tsx
<ChainOfThought>
  <ChainOfThoughtHeader>Analyzing the case study…</ChainOfThoughtHeader>
  <ChainOfThoughtContent>
    <ChainOfThoughtStep label="Fetched case study"      icon={DownloadIcon}  status="complete" />
    <ChainOfThoughtStep label="Extracting claims"       icon={SparklesIcon}  status="active" />
    <ChainOfThoughtStep label="Searching corroborations" icon={GlobeIcon}    status="pending" />
    <ChainOfThoughtSearchResults>
      {urls.map(u => <ChainOfThoughtSearchResult key={u}>{u}</ChainOfThoughtSearchResult>)}
    </ChainOfThoughtSearchResults>
  </ChainOfThoughtContent>
</ChainOfThought>
```

### `Tool` — generic tool card

Used for any `tool-*` part we don't bespoke-render:

```tsx
<Tool defaultOpen={part.state === 'output-error'}>
  <ToolHeader type={part.type} state={part.state} />
  <ToolContent>
    {(part.state === 'input-available' || part.state === 'output-available') && (
      <ToolInput input={part.input} />
    )}
    {part.state === 'output-available' && (
      <ToolOutput output={<MessageResponse>{format(part.output)}</MessageResponse>} />
    )}
    {part.state === 'output-error' && <ToolOutput errorText={part.errorText} output={null} />}
  </ToolContent>
</Tool>
```

The `ToolHeader` automatically renders a status badge (`Pending` / `Running` / `Awaiting Approval` / `Completed` / `Error` / `Denied`).

### `Sources` — web sources

```tsx
<Sources>
  <SourcesTrigger count={urlParts.length} />
  <SourcesContent>
    {urlParts.map(p => <Source key={p.url} href={p.url} title={p.title ?? p.url} />)}
  </SourcesContent>
</Sources>
```

Rendered above `<Message>` in the assistant turn.

### `InlineCitation` — citations in prose

```tsx
<InlineCitationText>
  Slow breathing increases HRV by ~12% over 8 weeks
  <InlineCitation>
    <InlineCitationCard>
      <InlineCitationCardTrigger sources={[citation.url]} />
      <InlineCitationCardBody>
        <InlineCitationSource title={citation.title} url={citation.url} />
        <InlineCitationQuote>{citation.snippet}</InlineCitationQuote>
      </InlineCitationCardBody>
    </InlineCitationCard>
  </InlineCitation>
</InlineCitationText>
```

We detect `[c:cs_lehrer_2014]`-style markers in assistant text and rewrite them into this structure client-side, resolving each marker against the tool results in the same turn.

### `Confirmation` — HITL approvals

```tsx
<Confirmation>
  <ConfirmationTitle>Save this protocol?</ConfirmationTitle>
  <ConfirmationRequest>
    <ProposedProtocolPreview proto={part.input} />
  </ConfirmationRequest>
  <ConfirmationActions>
    <ConfirmationAction onClick={() => addToolOutput({
      tool: 'proposeProtocol',
      toolCallId: part.toolCallId,
      output: { approved: true },
    })}>Save</ConfirmationAction>
    <ConfirmationAction variant="destructive" onClick={() => addToolOutput({
      tool: 'proposeProtocol',
      toolCallId: part.toolCallId,
      output: { approved: false },
    })}>Discard</ConfirmationAction>
  </ConfirmationActions>
</Confirmation>
```

For Mode B (workflow), the `onClick` instead `POST`s to a `defineHook` resume endpoint (see [doc 11 §6](./11-workflows-and-durable-agents.md#6-pattern-c--human-in-the-loop-confirmation)).

### `Artifact` — savable generated outputs

```tsx
<Artifact>
  <ArtifactHeader>
    <ArtifactTitle>Wind-down protocol</ArtifactTitle>
    <ArtifactDescription>6 steps · serves Sleep + HRV</ArtifactDescription>
    <ArtifactActions>
      <ArtifactAction tooltip="Save"        icon={SaveIcon}     onClick={save} />
      <ArtifactAction tooltip="Open"        icon={ExternalIcon} onClick={open} />
      <ArtifactAction tooltip="Edit inline" icon={EditIcon}     onClick={edit} />
      <ArtifactClose />
    </ArtifactActions>
  </ArtifactHeader>
  <ArtifactContent>
    <ProtocolPreview proto={part.output.protocol} />
  </ArtifactContent>
</Artifact>
```

### `Task` — linear progress lists

```tsx
<Task defaultOpen>
  <TaskTrigger title="Deep analysis" />
  <TaskContent>
    <TaskItem status="complete">Fetched case study</TaskItem>
    <TaskItem status="active">Extracting claims</TaskItem>
    <TaskItem status="pending">Synthesize report</TaskItem>
  </TaskContent>
</Task>
```

### `Plan` — multi-track plans (use sparingly)

For when the assistant proposes a *plan* (vs a single artifact) — e.g. an 8-week protocol with phases. Renders as a Kanban-ish grouped list. We use `Plan` sparingly; most plans should become `Artifact`-backed protocols.

### `PromptInput` + sub-elements — the composer

```tsx
<PromptInput onSubmit={handleSubmit}>
  <PromptInputBody>
    <PromptInputTextarea value={input} onChange={e => setInput(e.currentTarget.value)} />
    <PromptInputTools>
      <PromptInputActionMenu>
        <PromptInputActionMenuTrigger />
        <PromptInputActionMenuContent>
          <PromptInputActionAddAttachments />
          <PromptInputActionAddScreenshot />     {/* if you want screenshot drag-in */}
        </PromptInputActionMenuContent>
      </PromptInputActionMenu>
      <PromptInputModelSelect value={model} onValueChange={setModel}>
        <PromptInputModelSelectTrigger>
          <PromptInputModelSelectValue />
        </PromptInputModelSelectTrigger>
        <PromptInputModelSelectContent>
          {models.map(m => <PromptInputModelSelectItem key={m.id} value={m.id}>{m.name}</PromptInputModelSelectItem>)}
        </PromptInputModelSelectContent>
      </PromptInputModelSelect>
    </PromptInputTools>
    <PromptInputSubmit
      status={isStreaming ? 'streaming' : 'ready'}
      disabled={!input.trim() && !attachments.length}
    />
  </PromptInputBody>
</PromptInput>
```

The `Attachments` sub-tree handles file drop, paste, and screenshot capture. For our app we add a custom drop target that also accepts in-app drags (entity / note / highlight from the workbench panes — not files) and adds them to the same attachments list with a different `kind`.

### `Suggestion` — context-derived CTAs

Above the composer:

```tsx
<div className="flex gap-2 px-4 py-2 overflow-x-auto">
  {suggestions.map(s => (
    <Suggestion key={s.id} onClick={() => sendMessage({ text: s.prompt })}>
      {s.label}
    </Suggestion>
  ))}
</div>
```

Suggestions come from `/api/assistant/suggestions?route=…&focus=…` — see [doc 05 §13](./05-ai-assistant.md#13-suggestions-strip-proactive-but-cheap).

### `OpenInChat` — the "Continue this in the side pane" affordance

Used by the `⌘K` quick-ask modal: every quick-ask response shows an `OpenInChat` button that hands the same messages off to a real durable thread.

---

## 4. Custom tool cards — when to override the generic `Tool`

Build a bespoke per-tool card when **any** of these are true:

1. The tool has a recognizable shape the user benefits from seeing (e.g. an entity list, a chart, a protocol preview).
2. The tool kicks off a workflow whose `data-*` progress we want to render specially (`Task`, `ChainOfThought`).
3. The tool result is itself a savable artifact (`Artifact`).
4. The tool is HITL (`Confirmation`).

Tools we ship custom cards for in v1:

| Tool | Custom card |
|---|---|
| `searchEntities` | `SearchEntitiesCard` — grouped by entity type, save inline. |
| `getEntity` | `EntityPreviewCard` — collapsible entity card with "Open in pane" / "Save". |
| `proposeProtocol` | `ProposeProtocolCard` — uses `Artifact` + `Confirmation`. |
| `addProtocolStep` | `AddedStepCard` — small inline confirmation, undo. |
| `logBiomarkerReading` | `LoggedReadingCard` — value + spark trend + "Open chart". |
| `deepCaseStudyAnalysis` | `DeepCaseStudyAnalysisCard` — `Task` while streaming → `Artifact` when done. |
| `verifyClaim` | `ClaimVerificationCard` — `ChainOfThought` + verdict badge + `Sources`. |
| `webResearch` | `WebResearchCard` — live `Sources` + `MessageResponse`. |
| `parseLabPdf` | `LabReadingsApprovalCard` — `Confirmation` per row, bulk accept/edit. |

Everything else falls back to the generic `Tool` element.

---

## 5. Data-part type registry

We keep a single source of truth for `data-*` types so card components can `useAssistantStreamData(type, id)` with type safety:

```ts
// lib/ai/data-parts.ts
export type DataPartRegistry = {
  'data-analysis-progress': { stage: 'fetching' | 'extracting-claims' | 'searching-corroboration' | 'synthesizing'; pct: number }
  'data-analysis-result':   { reportId: string; summary: string; citations: Citation[] }
  'data-tavily-progress':   { phase: 'querying' | 'done'; q?: string; count?: number }
  'data-tavily-result':     { url: string; title: string; snippet?: string }
  'data-claim-evidence':    { stance: 'SUPPORTS' | 'OPPOSES' | 'MIXED'; sourceUrl: string; sourceTitle: string; quote?: string }
  'data-lab-extraction':    { rowIndex: number; biomarkerName: string; value: number; unit?: string; takenAt?: string }
  'data-protocol-step-draft': { title: string; layer: TimeLayer; cadence: Cadence }
  'data-workflow-marker':   { type: 'user-message'; id: string; content: string; timestamp: number } // multi-turn only
}

export type DataPartName = keyof DataPartRegistry
```

`useAssistantStreamData<T extends DataPartName>(type: T, id?: string): DataPartRegistry[T] | undefined` walks the messages from `useChat()`, finds the most recent matching part (filtered by `id === toolCallId` if given), and returns its `data` payload.

---

## 6. Theming

AI Elements is shadcn/ui under the hood — it picks up our Tailwind v4 design tokens automatically. We standardize on:

- `--radius` from shadcn defaults.
- `MessageContent` rounded corners are kept (we don't strip them).
- Reasoning text uses `text-muted-foreground` for visual deprioritization.
- Tool badges keep AI Elements' default colors (yellow/green/red) so users build muscle memory across surfaces.

If we want a denser pane (the side pane is narrow), we override only:

- `MessageContent`: `text-sm`.
- `ToolHeader`: `py-1`.
- `Reasoning`: `text-xs`.

These overrides live in our copy of each component file (since AI Elements installs into our codebase) — easy to maintain.

---

## 7. Anti-patterns to avoid

- ❌ Don't render `tool-invocation` or use `part.toolInvocation.args` — those are pre-v6 names and won't even compile under our typed agent.
- ❌ Don't dump tool JSON output into a `MessageResponse` — always wrap with `Tool` or a custom card so the user knows it's a tool result.
- ❌ Don't auto-mutate user data when the model proposes something — use `Confirmation` (Mode A) or HITL hook (Mode B).
- ❌ Don't put long-running work inside an `execute` — start a workflow and stream `data-*` parts.
- ❌ Don't ship without `Reasoning` and `Sources` for any model that can produce them. They're free signals of trustworthiness.
