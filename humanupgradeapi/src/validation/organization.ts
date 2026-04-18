import { z } from 'zod'
import {
  StringNullableOperationSchema,
  IntNullableOperationSchema,
  FloatNullableOperationSchema,
  StringListOperationSchema,
  createIdSlugWhereUniqueInputSchema,
  createSlugConnectOrCreateWhereInputSchema,
  buildConnectOrCreateInputSchema,
  buildToOneRelationUpdateSchema,
  buildToManyRelationUpdateSchema,
} from './scalars.js'
import { PersonToManyRelationUpdateInputSchema } from './person.js'
import { MediaToManyRelationUpdateInputSchema } from './media.js'

const OrganizationTypeEnum = z.enum([
  'BRAND', 'MANUFACTURER', 'RETAILER', 'LAB', 'CLINIC',
  'RESEARCH_INSTITUTION', 'NONPROFIT', 'MEDIA', 'SPONSOR',
  'HOLDING_COMPANY', 'OTHER',
])

export const OrganizationCreateInputSchema = z
  .object({
    slug: z.string().min(1),
    name: z.string().min(1),
    legalName: z.string().optional(),
    description: z.string().optional(),
    websiteUrl: z.string().url().optional(),
    headquarters: z.string().optional(),
    foundedYear: z.int().optional(),
    annualRevenue: z.number().optional(),
    stockTicker: z.string().optional(),
    employeeCount: z.int().optional(),
    organizationType: OrganizationTypeEnum.optional(),
    tags: z.array(z.string()).optional(),
    aliases: z.array(z.string()).optional(),
    domains: z.array(z.string()).optional(),
  })
export type OrganizationCreateInput = z.infer<typeof OrganizationCreateInputSchema>

export const OrganizationWhereUniqueInputSchema = createIdSlugWhereUniqueInputSchema()
export type OrganizationWhereUniqueInput = z.infer<typeof OrganizationWhereUniqueInputSchema>

export const OrganizationConnectOrCreateWhereInputSchema = createSlugConnectOrCreateWhereInputSchema()
export type OrganizationConnectOrCreateWhereInput = z.infer<typeof OrganizationConnectOrCreateWhereInputSchema>

export const OrganizationConnectOrCreateInputSchema = buildConnectOrCreateInputSchema(
  OrganizationConnectOrCreateWhereInputSchema,
  OrganizationCreateInputSchema,
)
export type OrganizationConnectOrCreateInput = z.infer<typeof OrganizationConnectOrCreateInputSchema>

export const OrganizationToOneRelationUpdateInputSchema = buildToOneRelationUpdateSchema(
  OrganizationWhereUniqueInputSchema,
  OrganizationCreateInputSchema,
  OrganizationConnectOrCreateInputSchema,
)
export type OrganizationToOneRelationUpdateInput = z.infer<typeof OrganizationToOneRelationUpdateInputSchema>

export const OrganizationToManyRelationUpdateInputSchema = buildToManyRelationUpdateSchema(
  OrganizationWhereUniqueInputSchema,
  OrganizationCreateInputSchema,
  OrganizationConnectOrCreateInputSchema,
)
export type OrganizationToManyRelationUpdateInput = z.infer<typeof OrganizationToManyRelationUpdateInputSchema>

export const OrganizationUpdateInputSchema = z
  .object({
    name: z.string().min(1).optional(),
    legalName: StringNullableOperationSchema.optional(),
    description: StringNullableOperationSchema.optional(),
    websiteUrl: StringNullableOperationSchema.optional(),
    headquarters: StringNullableOperationSchema.optional(),
    foundedYear: IntNullableOperationSchema.optional(),
    annualRevenue: FloatNullableOperationSchema.optional(),
    stockTicker: StringNullableOperationSchema.optional(),
    employeeCount: IntNullableOperationSchema.optional(),
    organizationType: OrganizationTypeEnum.optional(),
    tags: StringListOperationSchema.optional(),
    aliases: StringListOperationSchema.optional(),
    domains: StringListOperationSchema.optional(),
    owners: PersonToManyRelationUpdateInputSchema.optional(),
    executives: PersonToManyRelationUpdateInputSchema.optional(),
    media: MediaToManyRelationUpdateInputSchema.optional(),
  })
export type OrganizationUpdateInput = z.infer<typeof OrganizationUpdateInputSchema>
