import { z } from 'zod'
import {
  StringNullableOperationSchema,
  StringListOperationSchema,
  createIdSlugWhereUniqueInputSchema,
} from './scalars.js'
import { MediaToManyRelationUpdateInputSchema } from './media.js'

export const PodcastCreateInputSchema = z
  .object({
    slug: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    rssUrl: z.string().url().optional(),
    websiteUrl: z.string().url().optional(),
    hostName: z.string().optional(),
    language: z.string().optional(),
    isPublished: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  })
export type PodcastCreateInput = z.infer<typeof PodcastCreateInputSchema>

export const PodcastWhereUniqueInputSchema = createIdSlugWhereUniqueInputSchema()
export type PodcastWhereUniqueInput = z.infer<typeof PodcastWhereUniqueInputSchema>

export const PodcastUpdateInputSchema = z
  .object({
    title: z.string().min(1).optional(),
    subtitle: StringNullableOperationSchema.optional(),
    description: StringNullableOperationSchema.optional(),
    rssUrl: StringNullableOperationSchema.optional(),
    websiteUrl: StringNullableOperationSchema.optional(),
    hostName: StringNullableOperationSchema.optional(),
    language: StringNullableOperationSchema.optional(),
    isPublished: z.boolean().optional(),
    tags: StringListOperationSchema.optional(),
    media: MediaToManyRelationUpdateInputSchema.optional(),
  })
export type PodcastUpdateInput = z.infer<typeof PodcastUpdateInputSchema>
