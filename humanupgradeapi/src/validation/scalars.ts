import { z } from 'zod'

function countProvided(values: boolean[]) {
  return values.filter(Boolean).length
}

function pushCustomIssue(ctx: any, message: string) {
  ctx.issues.push({ code: 'custom', input: ctx.value, message })
}

function createExactlyOneSelectorCheck(selectorNames: string[]) {
  return (ctx: any) => {
    const provided = countProvided(selectorNames.map(name => ctx.value[name] !== undefined))
    if (provided === 0) {
      pushCustomIssue(ctx, `Provide exactly one of: ${selectorNames.join(', ')}`)
    }
    if (provided > 1) {
      pushCustomIssue(ctx, `Only one selector is allowed: ${selectorNames.join(', ')}`)
    }
  }
}

// ─── Nullable scalar patch operations ────────────────────────────────────────

export const StringNullableOperationSchema = z.object({
  set: z.string().optional(),
  clear: z.boolean().optional(),
}).check(
  ctx => {
    const provided = [ctx.value.set !== undefined, ctx.value.clear !== undefined].filter(Boolean).length
    if (provided === 0) pushCustomIssue(ctx, 'Provide set or clear')
    if (provided === 2) pushCustomIssue(ctx, 'Cannot provide both set and clear')
  }
)
export type StringNullableOperation = z.infer<typeof StringNullableOperationSchema>

export const IntNullableOperationSchema = z.object({
  set: z.int().optional(),
  clear: z.boolean().optional(),
}).check(
  ctx => {
    const provided = [ctx.value.set !== undefined, ctx.value.clear !== undefined].filter(Boolean).length
    if (provided === 0) pushCustomIssue(ctx, 'Provide set or clear')
    if (provided === 2) pushCustomIssue(ctx, 'Cannot provide both set and clear')
  }
)
export type IntNullableOperation = z.infer<typeof IntNullableOperationSchema>

export const FloatNullableOperationSchema = z.object({
  set: z.number().optional(),
  clear: z.boolean().optional(),
}).check(
  ctx => {
    const provided = [ctx.value.set !== undefined, ctx.value.clear !== undefined].filter(Boolean).length
    if (provided === 0) pushCustomIssue(ctx, 'Provide set or clear')
    if (provided === 2) pushCustomIssue(ctx, 'Cannot provide both set and clear')
  }
)
export type FloatNullableOperation = z.infer<typeof FloatNullableOperationSchema>

export const DateTimeNullableOperationSchema = z.object({
  set: z.string().datetime().optional(),
  clear: z.boolean().optional(),
}).check(
  ctx => {
    const provided = [ctx.value.set !== undefined, ctx.value.clear !== undefined].filter(Boolean).length
    if (provided === 0) pushCustomIssue(ctx, 'Provide set or clear')
    if (provided === 2) pushCustomIssue(ctx, 'Cannot provide both set and clear')
  }
)
export type DateTimeNullableOperation = z.infer<typeof DateTimeNullableOperationSchema>

export const DecimalNullableOperationSchema = z.object({
  set: z.number().optional(),
  clear: z.boolean().optional(),
}).check(
  ctx => {
    const provided = [ctx.value.set !== undefined, ctx.value.clear !== undefined].filter(Boolean).length
    if (provided === 0) pushCustomIssue(ctx, 'Provide set or clear')
    if (provided === 2) pushCustomIssue(ctx, 'Cannot provide both set and clear')
  }
)
export type DecimalNullableOperation = z.infer<typeof DecimalNullableOperationSchema>

// ─── String list operations ──────────────────────────────────────────────────

export const StringListOperationSchema = z.object({
  set: z.array(z.string().min(1)).optional(),
  add: z.array(z.string().min(1)).optional(),
  remove: z.array(z.string().min(1)).optional(),
}).check(
  ctx => {
    const { set, add, remove } = ctx.value
    const hasSet = set !== undefined
    const hasAdd = add !== undefined
    const hasRemove = remove !== undefined
    if (!hasSet && !hasAdd && !hasRemove) pushCustomIssue(ctx, 'At least one list operation is required')
    if (hasSet && (hasAdd || hasRemove)) {
      pushCustomIssue(ctx, 'set cannot be combined with add/remove')
    }
  }
)
export type StringListOperation = z.infer<typeof StringListOperationSchema>

// ─── Unique selectors ────────────────────────────────────────────────────────

export const createIdSlugWhereUniqueInputSchema = () => z.object({
  id: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
}).check(createExactlyOneSelectorCheck(['id', 'slug']))

export const createEpisodeWhereUniqueInputSchema = () => z.object({
  id: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  episodePageUrl: z.string().min(1).optional(),
}).check(createExactlyOneSelectorCheck(['id', 'slug', 'episodePageUrl']))

export const createIdOnlyWhereUniqueInputSchema = () => z.object({
  id: z.string().min(1),
})

export const createSlugConnectOrCreateWhereInputSchema = () => z.object({
  slug: z.string().min(1),
})

// ─── Relation operation schemas ──────────────────────────────────────────────

export const buildConnectOrCreateInputSchema = (
  whereSchema: z.ZodType,
  createSchema: z.ZodType,
) =>
  z.object({
    where: whereSchema,
    create: createSchema,
  })

export const buildToOneRelationUpdateSchema = (
  whereSchema: z.ZodType,
  createSchema: z.ZodType,
  connectOrCreateSchema: z.ZodType,
) => z.object({
  connect: whereSchema.optional(),
  disconnect: z.literal(true).optional(),
  create: createSchema.optional(),
  connectOrCreate: connectOrCreateSchema.optional(),
}).check(
  ctx => {
    const provided = countProvided([
      ctx.value.connect !== undefined,
      ctx.value.disconnect !== undefined,
      ctx.value.create !== undefined,
      ctx.value.connectOrCreate !== undefined,
    ])
    if (provided === 0) pushCustomIssue(ctx, 'Provide exactly one relation operation')
    if (provided > 1) pushCustomIssue(ctx, 'Only one relation operation is allowed')
  }
)

export const buildToManyRelationUpdateSchema = (
  whereSchema: z.ZodType,
  createSchema: z.ZodType,
  connectOrCreateSchema: z.ZodType,
) => z.object({
  set: z.array(whereSchema).min(1).optional(),
  connect: z.array(whereSchema).min(1).optional(),
  disconnect: z.array(whereSchema).min(1).optional(),
  create: z.array(createSchema).min(1).optional(),
  connectOrCreate: z.array(connectOrCreateSchema).min(1).optional(),
}).check(
  ctx => {
    const { set, connect, disconnect, create, connectOrCreate } = ctx.value
    const provided = countProvided([
      set !== undefined,
      connect !== undefined,
      disconnect !== undefined,
      create !== undefined,
      connectOrCreate !== undefined,
    ])

    if (provided === 0) pushCustomIssue(ctx, 'At least one relation operation is required')

    if (
      set !== undefined &&
      (connect !== undefined ||
        disconnect !== undefined ||
        create !== undefined ||
        connectOrCreate !== undefined)
    ) {
      pushCustomIssue(ctx, 'set cannot be combined with connect, disconnect, create, or connectOrCreate')
    }
  }
)
