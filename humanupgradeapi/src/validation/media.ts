import { z } from 'zod'
import {
  StringNullableOperationSchema,
  IntNullableOperationSchema,
  buildConnectOrCreateInputSchema,
  buildToManyRelationUpdateSchema,
  createIdOnlyWhereUniqueInputSchema,
} from './scalars.js'

const MediaTypeEnum = z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'LINK', 'OTHER'])

export const MediaCreateInputSchema = z.object({
  url: z.string().url(),
  type: MediaTypeEnum,
  mimeType: z.string().optional(),
  title: z.string().optional(),
  altText: z.string().optional(),
  caption: z.string().optional(),
  width: z.int().optional(),
  height: z.int().optional(),
  durationSeconds: z.int().optional(),
  fileSizeBytes: z.int().optional(),
  sortOrder: z.int().optional(),
  podcastId: z.string().optional(),
  episodeId: z.string().optional(),
  claimId: z.string().optional(),
  personId: z.string().optional(),
  organizationId: z.string().optional(),
  productId: z.string().optional(),
  compoundId: z.string().optional(),
  labTestId: z.string().optional(),
  biomarkerId: z.string().optional(),
  caseStudyId: z.string().optional(),
})
export type MediaCreateInput = z.infer<typeof MediaCreateInputSchema>

export const MediaWhereUniqueInputSchema = createIdOnlyWhereUniqueInputSchema()
export type MediaWhereUniqueInput = z.infer<typeof MediaWhereUniqueInputSchema>

export const MediaConnectOrCreateWhereInputSchema = createIdOnlyWhereUniqueInputSchema()
export type MediaConnectOrCreateWhereInput = z.infer<typeof MediaConnectOrCreateWhereInputSchema>

export const MediaConnectOrCreateInputSchema = buildConnectOrCreateInputSchema(
  MediaConnectOrCreateWhereInputSchema,
  MediaCreateInputSchema,
)
export type MediaConnectOrCreateInput = z.infer<typeof MediaConnectOrCreateInputSchema>

export const MediaToManyRelationUpdateInputSchema = buildToManyRelationUpdateSchema(
  MediaWhereUniqueInputSchema,
  MediaCreateInputSchema,
  MediaConnectOrCreateInputSchema,
)
export type MediaToManyRelationUpdateInput = z.infer<typeof MediaToManyRelationUpdateInputSchema>

export const MediaUpdateInputSchema = z.object({
  url: z.string().url().optional(),
  type: MediaTypeEnum.optional(),
  mimeType: StringNullableOperationSchema.optional(),
  title: StringNullableOperationSchema.optional(),
  altText: StringNullableOperationSchema.optional(),
  caption: StringNullableOperationSchema.optional(),
  width: IntNullableOperationSchema.optional(),
  height: IntNullableOperationSchema.optional(),
  durationSeconds: IntNullableOperationSchema.optional(),
  fileSizeBytes: IntNullableOperationSchema.optional(),
  sortOrder: z.int().optional(),
})
export type MediaUpdateInput = z.infer<typeof MediaUpdateInputSchema>
