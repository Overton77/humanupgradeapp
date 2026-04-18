import { z } from 'zod'
import {
  StringNullableOperationSchema,
  StringListOperationSchema,
  createIdSlugWhereUniqueInputSchema,
  createSlugConnectOrCreateWhereInputSchema,
  buildConnectOrCreateInputSchema,
  buildToOneRelationUpdateSchema,
  buildToManyRelationUpdateSchema,
} from './scalars.js'
import { MediaToManyRelationUpdateInputSchema } from './media.js'

export const PersonCreateInputSchema = z
  .object({
    slug: z.string().min(1),
    fullName: z.string().min(1),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    title: z.string().optional(),
    bio: z.string().optional(),
    websiteUrl: z.string().url().optional(),
    linkedinUrl: z.string().url().optional(),
    xUrl: z.string().url().optional(),
    aliases: z.array(z.string()).optional(),
    expertiseAreas: z.array(z.string()).optional(),
  })
export type PersonCreateInput = z.infer<typeof PersonCreateInputSchema>

export const PersonWhereUniqueInputSchema = createIdSlugWhereUniqueInputSchema()
export type PersonWhereUniqueInput = z.infer<typeof PersonWhereUniqueInputSchema>

export const PersonConnectOrCreateWhereInputSchema = createSlugConnectOrCreateWhereInputSchema()
export type PersonConnectOrCreateWhereInput = z.infer<typeof PersonConnectOrCreateWhereInputSchema>

export const PersonConnectOrCreateInputSchema = buildConnectOrCreateInputSchema(
  PersonConnectOrCreateWhereInputSchema,
  PersonCreateInputSchema,
)
export type PersonConnectOrCreateInput = z.infer<typeof PersonConnectOrCreateInputSchema>

export const PersonToOneRelationUpdateInputSchema = buildToOneRelationUpdateSchema(
  PersonWhereUniqueInputSchema,
  PersonCreateInputSchema,
  PersonConnectOrCreateInputSchema,
)
export type PersonToOneRelationUpdateInput = z.infer<typeof PersonToOneRelationUpdateInputSchema>

export const PersonToManyRelationUpdateInputSchema = buildToManyRelationUpdateSchema(
  PersonWhereUniqueInputSchema,
  PersonCreateInputSchema,
  PersonConnectOrCreateInputSchema,
)
export type PersonToManyRelationUpdateInput = z.infer<typeof PersonToManyRelationUpdateInputSchema>

export const PersonUpdateInputSchema = z
  .object({
    fullName: z.string().min(1).optional(),
    firstName: StringNullableOperationSchema.optional(),
    lastName: StringNullableOperationSchema.optional(),
    title: StringNullableOperationSchema.optional(),
    bio: StringNullableOperationSchema.optional(),
    websiteUrl: StringNullableOperationSchema.optional(),
    linkedinUrl: StringNullableOperationSchema.optional(),
    xUrl: StringNullableOperationSchema.optional(),
    aliases: StringListOperationSchema.optional(),
    expertiseAreas: StringListOperationSchema.optional(),
    media: MediaToManyRelationUpdateInputSchema.optional(),
  })
export type PersonUpdateInput = z.infer<typeof PersonUpdateInputSchema>
