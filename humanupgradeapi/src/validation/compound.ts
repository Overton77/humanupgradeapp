import { z } from 'zod'
import {
  StringNullableOperationSchema,
  StringListOperationSchema,
  createIdSlugWhereUniqueInputSchema,
  createSlugConnectOrCreateWhereInputSchema,
  buildConnectOrCreateInputSchema,
  buildToManyRelationUpdateSchema,
} from './scalars.js'
import { MediaToManyRelationUpdateInputSchema } from './media.js'

export const CompoundCreateInputSchema = z
  .object({
    slug: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    canonicalName: z.string().optional(),
    externalRef: z.string().optional(),
    aliases: z.array(z.string()).optional(),
    mechanisms: z.array(z.string()).optional(),
  })
export type CompoundCreateInput = z.infer<typeof CompoundCreateInputSchema>

export const CompoundWhereUniqueInputSchema = createIdSlugWhereUniqueInputSchema()
export type CompoundWhereUniqueInput = z.infer<typeof CompoundWhereUniqueInputSchema>

export const CompoundConnectOrCreateWhereInputSchema = createSlugConnectOrCreateWhereInputSchema()
export type CompoundConnectOrCreateWhereInput = z.infer<typeof CompoundConnectOrCreateWhereInputSchema>

export const CompoundConnectOrCreateInputSchema = buildConnectOrCreateInputSchema(
  CompoundConnectOrCreateWhereInputSchema,
  CompoundCreateInputSchema,
)
export type CompoundConnectOrCreateInput = z.infer<typeof CompoundConnectOrCreateInputSchema>

export const CompoundToManyRelationUpdateInputSchema = buildToManyRelationUpdateSchema(
  CompoundWhereUniqueInputSchema,
  CompoundCreateInputSchema,
  CompoundConnectOrCreateInputSchema,
)
export type CompoundToManyRelationUpdateInput = z.infer<typeof CompoundToManyRelationUpdateInputSchema>

export const CompoundUpdateInputSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: StringNullableOperationSchema.optional(),
    canonicalName: StringNullableOperationSchema.optional(),
    externalRef: StringNullableOperationSchema.optional(),
    aliases: StringListOperationSchema.optional(),
    mechanisms: StringListOperationSchema.optional(),
    media: MediaToManyRelationUpdateInputSchema.optional(),
  })
export type CompoundUpdateInput = z.infer<typeof CompoundUpdateInputSchema>
