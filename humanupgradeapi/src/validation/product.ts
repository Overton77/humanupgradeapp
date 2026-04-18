import { z } from 'zod'
import {
  StringNullableOperationSchema,
  DecimalNullableOperationSchema,
  StringListOperationSchema,
  createIdSlugWhereUniqueInputSchema,
  createSlugConnectOrCreateWhereInputSchema,
  buildConnectOrCreateInputSchema,
  buildToOneRelationUpdateSchema,
} from './scalars.js'
import { OrganizationToOneRelationUpdateInputSchema } from './organization.js'
import { CompoundToManyRelationUpdateInputSchema } from './compound.js'
import { MediaToManyRelationUpdateInputSchema } from './media.js'

export const ProductCreateInputSchema = z
  .object({
    slug: z.string().min(1),
    organizationId: z.string().optional(),
    isLabTestPanelDefinition: z.boolean().optional(),
    name: z.string().min(1),
    recommendedUse: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    sku: z.string().optional(),
    productUrl: z.string().url().optional(),
    price: z.number().optional(),
    currency: z.string().optional(),
    isActive: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    benefits: z.array(z.string()).optional(),
  })
export type ProductCreateInput = z.infer<typeof ProductCreateInputSchema>

export const ProductWhereUniqueInputSchema = createIdSlugWhereUniqueInputSchema()
export type ProductWhereUniqueInput = z.infer<typeof ProductWhereUniqueInputSchema>

export const ProductConnectOrCreateWhereInputSchema = createSlugConnectOrCreateWhereInputSchema()
export type ProductConnectOrCreateWhereInput = z.infer<typeof ProductConnectOrCreateWhereInputSchema>

export const ProductConnectOrCreateInputSchema = buildConnectOrCreateInputSchema(
  ProductConnectOrCreateWhereInputSchema,
  ProductCreateInputSchema,
)
export type ProductConnectOrCreateInput = z.infer<typeof ProductConnectOrCreateInputSchema>

export const ProductToOneRelationUpdateInputSchema = buildToOneRelationUpdateSchema(
  ProductWhereUniqueInputSchema,
  ProductCreateInputSchema,
  ProductConnectOrCreateInputSchema,
)
export type ProductToOneRelationUpdateInput = z.infer<typeof ProductToOneRelationUpdateInputSchema>

export const ProductUpdateInputSchema = z
  .object({
    name: z.string().min(1).optional(),
    recommendedUse: StringNullableOperationSchema.optional(),
    description: StringNullableOperationSchema.optional(),
    category: StringNullableOperationSchema.optional(),
    sku: StringNullableOperationSchema.optional(),
    productUrl: StringNullableOperationSchema.optional(),
    price: DecimalNullableOperationSchema.optional(),
    currency: StringNullableOperationSchema.optional(),
    isActive: z.boolean().optional(),
    isLabTestPanelDefinition: z.boolean().optional(),
    tags: StringListOperationSchema.optional(),
    categories: StringListOperationSchema.optional(),
    benefits: StringListOperationSchema.optional(),
    organization: OrganizationToOneRelationUpdateInputSchema.optional(),
    containsCompounds: CompoundToManyRelationUpdateInputSchema.optional(),
    media: MediaToManyRelationUpdateInputSchema.optional(),
  })
export type ProductUpdateInput = z.infer<typeof ProductUpdateInputSchema>
