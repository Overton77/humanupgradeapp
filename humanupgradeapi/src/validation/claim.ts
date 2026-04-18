import { z } from 'zod'
import {
  StringNullableOperationSchema,
  IntNullableOperationSchema,
  StringListOperationSchema,
  createIdOnlyWhereUniqueInputSchema,
} from './scalars.js'
import { PersonToOneRelationUpdateInputSchema } from './person.js'
import { MediaToManyRelationUpdateInputSchema } from './media.js'

const ClaimTypeEnum = z.enum([
  'FACTUAL',
  'CAUSAL',
  'MECHANISTIC',
  'MECHANISM_BIOLOGICAL',
  'STATISTICAL',
  'ANECDOTAL',
  'RECOMMENDATION',
  'CLINICAL_APPLICATION',
  'SAFETY_RISK',
  'INTERVENTION_PROTOCOL',
  'INTERVENTION_TECHNOLOGY',
  'PRODUCT_CLAIM',
  'OTHER',
])
const ClaimStanceEnum = z.enum([
  'SUPPORTS',
  'OPPOSES',
  'ASSERTED',
  'NEUTRAL',
  'MIXED',
  'SUGGESTED',
  'ANECDOTAL',
  'UNKNOWN',
])
const ClaimConfidenceEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', 'UNKNOWN'])

export const ClaimCreateInputSchema = z
  .object({
    episodeId: z.string().min(1),
    speakerId: z.string().optional(),
    probableSpeaker: z.string().optional(),
    text: z.string().min(1),
    evidenceExcerpt: z.string().optional(),
    claimType: ClaimTypeEnum.optional(),
    stance: ClaimStanceEnum.optional(),
    claimConfidence: ClaimConfidenceEnum.optional(),
    startTimeSeconds: z.int().optional(),
    endTimeSeconds: z.int().optional(),
    sourceUrl: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    evidenceUrls: z.array(z.string().url()).optional(),
  })
export type ClaimCreateInput = z.infer<typeof ClaimCreateInputSchema>

export const ClaimWhereUniqueInputSchema = createIdOnlyWhereUniqueInputSchema()
export type ClaimWhereUniqueInput = z.infer<typeof ClaimWhereUniqueInputSchema>

export const ClaimUpdateInputSchema = z
  .object({
    text: z.string().min(1).optional(),
    evidenceExcerpt: StringNullableOperationSchema.optional(),
    probableSpeaker: StringNullableOperationSchema.optional(),
    claimType: ClaimTypeEnum.optional(),
    stance: ClaimStanceEnum.optional(),
    claimConfidence: ClaimConfidenceEnum.optional(),
    startTimeSeconds: IntNullableOperationSchema.optional(),
    endTimeSeconds: IntNullableOperationSchema.optional(),
    sourceUrl: StringNullableOperationSchema.optional(),
    tags: StringListOperationSchema.optional(),
    evidenceUrls: StringListOperationSchema.optional(),
    speaker: PersonToOneRelationUpdateInputSchema.optional(),
    media: MediaToManyRelationUpdateInputSchema.optional(),
  })
export type ClaimUpdateInput = z.infer<typeof ClaimUpdateInputSchema>
