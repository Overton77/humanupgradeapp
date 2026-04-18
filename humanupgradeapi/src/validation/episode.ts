import { z } from 'zod'
import {
  StringNullableOperationSchema,
  IntNullableOperationSchema,
  DateTimeNullableOperationSchema,
  StringListOperationSchema,
  createEpisodeWhereUniqueInputSchema,
} from './scalars.js'
import { PersonToManyRelationUpdateInputSchema } from './person.js'
import { OrganizationToManyRelationUpdateInputSchema } from './organization.js'
import { MediaToManyRelationUpdateInputSchema } from './media.js'

const TranscriptStatusEnum = z.enum(['MISSING', 'QUEUED', 'STORED', 'ERROR'])
const PipelineStatusEnum = z.enum(['NOT_STARTED', 'RUNNING', 'COMPLETE', 'ERROR'])
const PublishStatusEnum = z.enum(['HIDDEN', 'READY'])

export const EpisodeCreateInputSchema = z
  .object({
  slug: z.string().min(1),
  podcastId: z.string().min(1),
  title: z.string().min(1),
  episodeNumber: z.int().optional(),
  seasonNumber: z.int().optional(),
  channelName: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  transcript: z.string().optional(),
  transcriptSourceUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  publishedAt: z.string().datetime().optional(),
  durationSeconds: z.int().optional(),
  isPublished: z.boolean().optional(),

  webPageSummary: z.string().optional(),
  summaryShort: z.string().optional(),
  summaryDetailed: z.string().optional(),
  publishedSummary: z.string().optional(),

  episodePageUrl: z.string().url().optional(),
  episodeTranscriptUrl: z.string().url().optional(),

  youtubeVideoId: z.string().optional(),
  youtubeEmbedUrl: z.string().url().optional(),
  youtubeWatchUrl: z.string().url().optional(),

  s3TranscriptKey: z.string().optional(),
  s3TranscriptUrl: z.string().url().optional(),
  transcriptStatus: TranscriptStatusEnum.optional(),
  transcriptSha256: z.string().optional(),

  topicPrimary: z.string().optional(),
  topicSecondary: z.array(z.string()).optional(),
  topicConcepts: z.array(z.string()).optional(),

  enrichmentStage1Status: PipelineStatusEnum.optional(),
  enrichmentStage2Status: PipelineStatusEnum.optional(),

  publishStatus: PublishStatusEnum.optional(),

  tags: z.array(z.string()).optional(),
  keyTakeaways: z.array(z.string()).optional(),
  topics: z.array(z.string()).optional(),

  webPageTimelines: z.any().optional(),
  })
export type EpisodeCreateInput = z.infer<typeof EpisodeCreateInputSchema>

export const EpisodeWhereUniqueInputSchema = createEpisodeWhereUniqueInputSchema()
export type EpisodeWhereUniqueInput = z.infer<typeof EpisodeWhereUniqueInputSchema>

export const EpisodeUpdateInputSchema = z
  .object({
  title: z.string().min(1).optional(),
  episodeNumber: IntNullableOperationSchema.optional(),
  seasonNumber: IntNullableOperationSchema.optional(),
  channelName: StringNullableOperationSchema.optional(),
  summary: StringNullableOperationSchema.optional(),
  description: StringNullableOperationSchema.optional(),
  transcript: StringNullableOperationSchema.optional(),
  transcriptSourceUrl: StringNullableOperationSchema.optional(),
  audioUrl: StringNullableOperationSchema.optional(),
  videoUrl: StringNullableOperationSchema.optional(),
  publishedAt: DateTimeNullableOperationSchema.optional(),
  durationSeconds: IntNullableOperationSchema.optional(),
  isPublished: z.boolean().optional(),

  webPageSummary: StringNullableOperationSchema.optional(),
  summaryShort: StringNullableOperationSchema.optional(),
  summaryDetailed: StringNullableOperationSchema.optional(),
  publishedSummary: StringNullableOperationSchema.optional(),

  episodePageUrl: StringNullableOperationSchema.optional(),
  episodeTranscriptUrl: StringNullableOperationSchema.optional(),

  youtubeVideoId: StringNullableOperationSchema.optional(),
  youtubeEmbedUrl: StringNullableOperationSchema.optional(),
  youtubeWatchUrl: StringNullableOperationSchema.optional(),

  s3TranscriptKey: StringNullableOperationSchema.optional(),
  s3TranscriptUrl: StringNullableOperationSchema.optional(),
  transcriptStatus: TranscriptStatusEnum.optional(),
  transcriptSha256: StringNullableOperationSchema.optional(),

  topicPrimary: StringNullableOperationSchema.optional(),
  topicSecondary: StringListOperationSchema.optional(),
  topicConcepts: StringListOperationSchema.optional(),

  enrichmentStage1Status: PipelineStatusEnum.optional(),
  enrichmentStage2Status: PipelineStatusEnum.optional(),

  publishStatus: PublishStatusEnum.optional(),

  tags: StringListOperationSchema.optional(),
  keyTakeaways: StringListOperationSchema.optional(),
  topics: StringListOperationSchema.optional(),

  webPageTimelines: z.any().optional(),

  guests: PersonToManyRelationUpdateInputSchema.optional(),
  sponsorOrganizations: OrganizationToManyRelationUpdateInputSchema.optional(),
  media: MediaToManyRelationUpdateInputSchema.optional(),
  })
export type EpisodeUpdateInput = z.infer<typeof EpisodeUpdateInputSchema>
