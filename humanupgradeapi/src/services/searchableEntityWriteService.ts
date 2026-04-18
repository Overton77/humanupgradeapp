import type { GraphQLContext } from '../lib/context.js'
import { getDependentEmbeddingTargets } from '../search/embeddings/dependencyMap.js'
import { getEmbeddingEntityDelegate } from '../search/embeddings/entityMetadata.js'
import { syncEmbeddingForEntity } from '../search/embeddings/syncEmbeddingForEntity.js'
import type {
  BiomarkerCreateInput,
  BiomarkerUpdateInput,
  BiomarkerWhereUniqueInput,
  CaseStudyCreateInput,
  CaseStudyUpdateInput,
  CaseStudyWhereUniqueInput,
  ClaimCreateInput,
  ClaimUpdateInput,
  ClaimWhereUniqueInput,
  CompoundCreateInput,
  CompoundUpdateInput,
  CompoundWhereUniqueInput,
  EpisodeCreateInput,
  EpisodeUpdateInput,
  EpisodeWhereUniqueInput,
  LabTestCreateInput,
  LabTestUpdateInput,
  LabTestWhereUniqueInput,
  MediaCreateInput,
  OrganizationCreateInput,
  OrganizationUpdateInput,
  OrganizationWhereUniqueInput,
  PersonCreateInput,
  PersonUpdateInput,
  PersonWhereUniqueInput,
  PodcastCreateInput,
  PodcastUpdateInput,
  PodcastWhereUniqueInput,
  ProductCreateInput,
  ProductUpdateInput,
  ProductWhereUniqueInput,
} from '../validation/index.js'
import type {
  EmbeddingSelector,
  EmbeddingSourceEntity,
  EmbeddingWriteOptions,
  NestedEmbeddingSyncCandidate,
} from '../search/embeddings/types.js'
import { resolveEmbeddingWriteMode } from '../search/embeddings/types.js'
import {
  applyNullableOp,
  applyStringListOp,
  buildToManyRelationMutationPlan,
  buildToOneRelationMutationPlan,
  resolveEpisodeWhereUnique,
  resolveWhere,
} from '../graphql/resolvers/helpers.js'

interface IdWhereInput {
  id?: string | null
}

interface IdSlugWhereInput extends IdWhereInput {
  slug?: string | null
}

interface ToOneRelationUpdateInput<TCreate> {
  connect?: IdSlugWhereInput
  disconnect?: boolean
  create?: TCreate
  connectOrCreate?: {
    where: IdSlugWhereInput
    create: TCreate
  }
}

interface ToManyRelationUpdateInput<TCreate> {
  set?: IdSlugWhereInput[]
  connect?: IdSlugWhereInput[]
  disconnect?: IdSlugWhereInput[]
  create?: TCreate[]
  connectOrCreate?: Array<{
    where: IdSlugWhereInput
    create: TCreate
  }>
}

interface MediaNestedCreateData {
  url: MediaCreateInput['url']
  type: MediaCreateInput['type']
  mimeType?: MediaCreateInput['mimeType']
  title?: MediaCreateInput['title']
  altText?: MediaCreateInput['altText']
  caption?: MediaCreateInput['caption']
  width?: MediaCreateInput['width']
  height?: MediaCreateInput['height']
  durationSeconds?: MediaCreateInput['durationSeconds']
  fileSizeBytes?: MediaCreateInput['fileSizeBytes']
  sortOrder?: MediaCreateInput['sortOrder']
}

interface MediaToManyRelationInput {
  set?: IdWhereInput[]
  connect?: IdWhereInput[]
  disconnect?: IdWhereInput[]
  create?: MediaCreateInput[]
  connectOrCreate?: Array<{
    where: IdWhereInput
    create: MediaCreateInput
  }>
}

interface MediaRelationMutationData {
  set?: Array<{ id: string }>
  connect?: Array<{ id: string }>
  disconnect?: Array<{ id: string }>
  create?: MediaNestedCreateData[]
}

function asToOneRelationUpdateInput<TCreate>(value: unknown) {
  return value as ToOneRelationUpdateInput<TCreate> | undefined
}

function asToManyRelationUpdateInput<TCreate>(value: unknown) {
  return value as ToManyRelationUpdateInput<TCreate> | undefined
}

function asMediaToManyRelationUpdateInput(value: unknown) {
  return value as MediaToManyRelationInput | undefined
}

function pickDefined(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) result[key] = value
  }
  return result
}

function sanitizeMediaCreateInput(input: MediaCreateInput): MediaNestedCreateData {
  return {
    url: input?.url,
    type: input?.type,
    ...(input.mimeType !== undefined ? { mimeType: input.mimeType } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.altText !== undefined ? { altText: input.altText } : {}),
    ...(input.caption !== undefined ? { caption: input.caption } : {}),
    ...(input.width !== undefined ? { width: input.width } : {}),
    ...(input.height !== undefined ? { height: input.height } : {}),
    ...(input.durationSeconds !== undefined ? { durationSeconds: input.durationSeconds } : {}),
    ...(input.fileSizeBytes !== undefined ? { fileSizeBytes: input.fileSizeBytes } : {}),
    ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
  }
}

async function buildMediaToManyRelationMutationPlan(
  prisma: GraphQLContext['prisma'],
  op: MediaToManyRelationInput | undefined,
) {
  if (op === undefined) {
    return {
      data: undefined as MediaRelationMutationData | undefined,
      touched: false,
    }
  }

  const data: MediaRelationMutationData = {}

  if (op.set) {
    data.set = op.set.map(where => resolveWhere(where, ['id']))
  }

  if (op.connect) {
    data.connect = op.connect.map(where => resolveWhere(where, ['id']))
  }

  if (op.disconnect) {
    data.disconnect = op.disconnect.map(where => resolveWhere(where, ['id']))
  }

  if (op.create) {
    data.create = op.create.map(create => sanitizeMediaCreateInput(create))
  }

  if (op.connectOrCreate) {
    for (const item of op.connectOrCreate) {
      const existing = await prisma.media.findUnique({
        where: resolveWhere(item.where, ['id']),
        select: { id: true },
      })

      if (existing) {
        const connect = data.connect ?? []
        connect.push({ id: existing.id })
        data.connect = connect
        continue
      }

      const create = data.create ?? []
      create.push(sanitizeMediaCreateInput(item.create))
      data.create = create
    }
  }

  return {
    data,
    touched: true,
  }
}

async function resolveEntityIdFromSelector(
  ctx: GraphQLContext,
  entity: EmbeddingSourceEntity,
  selector: EmbeddingSelector,
): Promise<string> {
  if (selector.id) return selector.id
  if (!selector.slug) {
    throw new Error(`Missing selector for nested ${entity} embedding sync`)
  }

  const delegate = getEmbeddingEntityDelegate(ctx.prisma, entity)
  const existing = await delegate.findUniqueOrThrow({
    where: { slug: selector.slug },
    select: { id: true },
  })

  return existing.id
}

function dedupeTargets(
  targets: Array<{ entity: EmbeddingSourceEntity; entityId: string }>,
) {
  const seen = new Set<string>()

  return targets.filter(target => {
    const key = `${target.entity}:${target.entityId}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function syncTargetSilently(
  ctx: GraphQLContext,
  entity: EmbeddingSourceEntity,
  entityId: string,
  mode: ReturnType<typeof resolveEmbeddingWriteMode>,
) {
  try {
    await syncEmbeddingForEntity({
      prisma: ctx.prisma,
      entity,
      entityId,
      mode,
    })
  } catch (error) {
    console.error(`[embeddings] Failed to sync ${entity}:${entityId}`, error)
  }
}

async function syncNestedCandidates(
  ctx: GraphQLContext,
  candidates: NestedEmbeddingSyncCandidate[],
) {
  const resolvedCandidates = await Promise.all(
    candidates.map(async candidate => ({
      entity: candidate.entity,
      entityId: await resolveEntityIdFromSelector(ctx, candidate.entity, candidate.selector),
      mode: candidate.mode,
    })),
  )
  const uniqueCandidates = new Map<string, (typeof resolvedCandidates)[number]>()

  for (const candidate of resolvedCandidates) {
    uniqueCandidates.set(`${candidate.entity}:${candidate.entityId}`, candidate)
  }

  for (const candidate of uniqueCandidates.values()) {
    await syncTargetSilently(ctx, candidate.entity, candidate.entityId, candidate.mode)
  }
}

async function runPostWriteEmbeddingSync(args: {
  ctx: GraphQLContext
  entity: EmbeddingSourceEntity
  entityId: string
  embedding?: EmbeddingWriteOptions | null
  nestedCandidates?: NestedEmbeddingSyncCandidate[]
  additionalTargets?: Array<{ entity: EmbeddingSourceEntity; entityId: string }>
}) {
  const {
    ctx,
    entity,
    entityId,
    embedding,
    nestedCandidates = [],
    additionalTargets = [],
  } = args
  const mode = resolveEmbeddingWriteMode(embedding)

  await syncTargetSilently(ctx, entity, entityId, mode)
  await syncNestedCandidates(ctx, nestedCandidates)

  const dependentTargets = await getDependentEmbeddingTargets({
    prisma: ctx.prisma,
    entity,
    entityId,
  })

  for (const target of dedupeTargets([...additionalTargets, ...dependentTargets])) {
    if (target.entity === entity && target.entityId === entityId) continue
    await syncTargetSilently(ctx, target.entity, target.entityId, mode)
  }
}

export async function createPodcast(args: {
  ctx: GraphQLContext
  data: PodcastCreateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const podcast = await args.ctx.prisma.podcast.create({ data: args.data })
  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'podcast',
    entityId: podcast.id,
    embedding: args.embedding,
  })
  return podcast
}

export async function updatePodcast(args: {
  ctx: GraphQLContext
  where: PodcastWhereUniqueInput
  data: PodcastUpdateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const existing = await args.ctx.prisma.podcast.findUniqueOrThrow({
    where: resolveWhere(args.where),
  })
  const mediaPlan = await buildMediaToManyRelationMutationPlan(
    args.ctx.prisma,
    asMediaToManyRelationUpdateInput(args.data.media),
  )

  const podcast = await args.ctx.prisma.podcast.update({
    where: { id: existing.id },
    data: pickDefined({
      title: args.data.title,
      subtitle: applyNullableOp(args.data.subtitle),
      description: applyNullableOp(args.data.description),
      rssUrl: applyNullableOp(args.data.rssUrl),
      websiteUrl: applyNullableOp(args.data.websiteUrl),
      hostName: applyNullableOp(args.data.hostName),
      language: applyNullableOp(args.data.language),
      isPublished: args.data.isPublished,
      tags: args.data.tags
        ? { set: applyStringListOp(existing.tags, args.data.tags)! }
        : undefined,
      media: mediaPlan.data,
    }),
  })

  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'podcast',
    entityId: podcast.id,
    embedding: args.embedding,
  })
  return podcast
}

export async function createEpisode(args: {
  ctx: GraphQLContext
  data: EpisodeCreateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const episode = await args.ctx.prisma.episode.create({ data: args.data })
  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'episode',
    entityId: episode.id,
    embedding: args.embedding,
  })
  return episode
}

export async function updateEpisode(args: {
  ctx: GraphQLContext
  where: EpisodeWhereUniqueInput
  data: EpisodeUpdateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const mode = resolveEmbeddingWriteMode(args.embedding)
  const existing = await args.ctx.prisma.episode.findUniqueOrThrow({
    where: resolveEpisodeWhereUnique(args.where),
  })
  const guestsPlan = await buildToManyRelationMutationPlan(
    asToManyRelationUpdateInput<PersonCreateInput>(args.data.guests),
    {
    prisma: args.ctx.prisma,
    searchableEntity: 'person',
    mode,
  })
  const sponsorsPlan = await buildToManyRelationMutationPlan(
    asToManyRelationUpdateInput<OrganizationCreateInput>(args.data.sponsorOrganizations),
    {
    prisma: args.ctx.prisma,
    searchableEntity: 'organization',
    mode,
  })
  const mediaPlan = await buildMediaToManyRelationMutationPlan(
    args.ctx.prisma,
    asMediaToManyRelationUpdateInput(args.data.media),
  )

  const episode = await args.ctx.prisma.episode.update({
    where: { id: existing.id },
    data: pickDefined({
      title: args.data.title,
      episodeNumber: applyNullableOp(args.data.episodeNumber),
      seasonNumber: applyNullableOp(args.data.seasonNumber),
      channelName: applyNullableOp(args.data.channelName),
      summary: applyNullableOp(args.data.summary),
      description: applyNullableOp(args.data.description),
      transcript: applyNullableOp(args.data.transcript),
      transcriptSourceUrl: applyNullableOp(args.data.transcriptSourceUrl),
      audioUrl: applyNullableOp(args.data.audioUrl),
      videoUrl: applyNullableOp(args.data.videoUrl),
      publishedAt: applyNullableOp(args.data.publishedAt),
      durationSeconds: applyNullableOp(args.data.durationSeconds),
      isPublished: args.data.isPublished,
      webPageSummary: applyNullableOp(args.data.webPageSummary),
      summaryShort: applyNullableOp(args.data.summaryShort),
      summaryDetailed: applyNullableOp(args.data.summaryDetailed),
      publishedSummary: applyNullableOp(args.data.publishedSummary),
      episodePageUrl: applyNullableOp(args.data.episodePageUrl),
      episodeTranscriptUrl: applyNullableOp(args.data.episodeTranscriptUrl),
      youtubeVideoId: applyNullableOp(args.data.youtubeVideoId),
      youtubeEmbedUrl: applyNullableOp(args.data.youtubeEmbedUrl),
      youtubeWatchUrl: applyNullableOp(args.data.youtubeWatchUrl),
      s3TranscriptKey: applyNullableOp(args.data.s3TranscriptKey),
      s3TranscriptUrl: applyNullableOp(args.data.s3TranscriptUrl),
      transcriptStatus: args.data.transcriptStatus,
      transcriptSha256: applyNullableOp(args.data.transcriptSha256),
      topicPrimary: applyNullableOp(args.data.topicPrimary),
      topicSecondary: args.data.topicSecondary
        ? { set: applyStringListOp(existing.topicSecondary, args.data.topicSecondary)! }
        : undefined,
      topicConcepts: args.data.topicConcepts
        ? { set: applyStringListOp(existing.topicConcepts, args.data.topicConcepts)! }
        : undefined,
      enrichmentStage1Status: args.data.enrichmentStage1Status,
      enrichmentStage2Status: args.data.enrichmentStage2Status,
      publishStatus: args.data.publishStatus,
      tags: args.data.tags ? { set: applyStringListOp(existing.tags, args.data.tags)! } : undefined,
      keyTakeaways: args.data.keyTakeaways
        ? { set: applyStringListOp(existing.keyTakeaways, args.data.keyTakeaways)! }
        : undefined,
      topics: args.data.topics
        ? { set: applyStringListOp(existing.topics, args.data.topics)! }
        : undefined,
      webPageTimelines: args.data.webPageTimelines,
      guests: guestsPlan.data,
      sponsorOrganizations: sponsorsPlan.data,
      media: mediaPlan.data,
    }),
  })

  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'episode',
    entityId: episode.id,
    embedding: args.embedding,
    nestedCandidates: [
      ...guestsPlan.createdEmbeddingCandidates,
      ...sponsorsPlan.createdEmbeddingCandidates,
    ],
  })
  return episode
}

export async function createClaim(args: {
  ctx: GraphQLContext
  data: ClaimCreateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const claim = await args.ctx.prisma.claim.create({ data: args.data })
  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'claim',
    entityId: claim.id,
    embedding: args.embedding,
  })
  return claim
}

export async function updateClaim(args: {
  ctx: GraphQLContext
  where: ClaimWhereUniqueInput
  data: ClaimUpdateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const mode = resolveEmbeddingWriteMode(args.embedding)
  const existing = await args.ctx.prisma.claim.findUniqueOrThrow({
    where: resolveWhere(args.where, ['id']),
  })
  const speakerPlan = await buildToOneRelationMutationPlan(
    asToOneRelationUpdateInput<PersonCreateInput>(args.data.speaker),
    {
    prisma: args.ctx.prisma,
    searchableEntity: 'person',
    mode,
  })
  const mediaPlan = await buildMediaToManyRelationMutationPlan(
    args.ctx.prisma,
    asMediaToManyRelationUpdateInput(args.data.media),
  )

  const claim = await args.ctx.prisma.claim.update({
    where: { id: existing.id },
    data: pickDefined({
      text: args.data.text,
      evidenceExcerpt: applyNullableOp(args.data.evidenceExcerpt),
      claimType: args.data.claimType,
      stance: args.data.stance,
      claimConfidence: args.data.claimConfidence,
      startTimeSeconds: applyNullableOp(args.data.startTimeSeconds),
      endTimeSeconds: applyNullableOp(args.data.endTimeSeconds),
      sourceUrl: applyNullableOp(args.data.sourceUrl),
      tags: args.data.tags ? { set: applyStringListOp(existing.tags, args.data.tags)! } : undefined,
      evidenceUrls: args.data.evidenceUrls
        ? { set: applyStringListOp(existing.evidenceUrls, args.data.evidenceUrls)! }
        : undefined,
      speaker: speakerPlan.data,
      media: mediaPlan.data,
    }),
  })

  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'claim',
    entityId: claim.id,
    embedding: args.embedding,
    nestedCandidates: speakerPlan.createdEmbeddingCandidates,
  })
  return claim
}

export async function createPerson(args: {
  ctx: GraphQLContext
  data: PersonCreateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const person = await args.ctx.prisma.person.create({ data: args.data })
  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'person',
    entityId: person.id,
    embedding: args.embedding,
  })
  return person
}

export async function updatePerson(args: {
  ctx: GraphQLContext
  where: PersonWhereUniqueInput
  data: PersonUpdateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const existing = await args.ctx.prisma.person.findUniqueOrThrow({
    where: resolveWhere(args.where),
  })
  const mediaPlan = await buildMediaToManyRelationMutationPlan(
    args.ctx.prisma,
    asMediaToManyRelationUpdateInput(args.data.media),
  )

  const person = await args.ctx.prisma.person.update({
    where: { id: existing.id },
    data: pickDefined({
      fullName: args.data.fullName,
      firstName: applyNullableOp(args.data.firstName),
      lastName: applyNullableOp(args.data.lastName),
      title: applyNullableOp(args.data.title),
      bio: applyNullableOp(args.data.bio),
      websiteUrl: applyNullableOp(args.data.websiteUrl),
      linkedinUrl: applyNullableOp(args.data.linkedinUrl),
      xUrl: applyNullableOp(args.data.xUrl),
      aliases: args.data.aliases
        ? { set: applyStringListOp(existing.aliases, args.data.aliases)! }
        : undefined,
      expertiseAreas: args.data.expertiseAreas
        ? { set: applyStringListOp(existing.expertiseAreas, args.data.expertiseAreas)! }
        : undefined,
      media: mediaPlan.data,
    }),
  })

  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'person',
    entityId: person.id,
    embedding: args.embedding,
  })
  return person
}

export async function createOrganization(args: {
  ctx: GraphQLContext
  data: OrganizationCreateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const organization = await args.ctx.prisma.organization.create({ data: args.data })
  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'organization',
    entityId: organization.id,
    embedding: args.embedding,
  })
  return organization
}

export async function updateOrganization(args: {
  ctx: GraphQLContext
  where: OrganizationWhereUniqueInput
  data: OrganizationUpdateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const mode = resolveEmbeddingWriteMode(args.embedding)
  const existing = await args.ctx.prisma.organization.findUniqueOrThrow({
    where: resolveWhere(args.where),
  })
  const ownersPlan = await buildToManyRelationMutationPlan(
    asToManyRelationUpdateInput<PersonCreateInput>(args.data.owners),
    {
    prisma: args.ctx.prisma,
    searchableEntity: 'person',
    mode,
  })
  const executivesPlan = await buildToManyRelationMutationPlan(
    asToManyRelationUpdateInput<PersonCreateInput>(args.data.executives),
    {
    prisma: args.ctx.prisma,
    searchableEntity: 'person',
    mode,
  })
  const mediaPlan = await buildMediaToManyRelationMutationPlan(
    args.ctx.prisma,
    asMediaToManyRelationUpdateInput(args.data.media),
  )

  const organization = await args.ctx.prisma.organization.update({
    where: { id: existing.id },
    data: pickDefined({
      name: args.data.name,
      legalName: applyNullableOp(args.data.legalName),
      description: applyNullableOp(args.data.description),
      websiteUrl: applyNullableOp(args.data.websiteUrl),
      headquarters: applyNullableOp(args.data.headquarters),
      foundedYear: applyNullableOp(args.data.foundedYear),
      annualRevenue: applyNullableOp(args.data.annualRevenue),
      stockTicker: applyNullableOp(args.data.stockTicker),
      employeeCount: applyNullableOp(args.data.employeeCount),
      organizationType: args.data.organizationType,
      tags: args.data.tags ? { set: applyStringListOp(existing.tags, args.data.tags)! } : undefined,
      aliases: args.data.aliases
        ? { set: applyStringListOp(existing.aliases, args.data.aliases)! }
        : undefined,
      domains: args.data.domains
        ? { set: applyStringListOp(existing.domains, args.data.domains)! }
        : undefined,
      owners: ownersPlan.data,
      executives: executivesPlan.data,
      media: mediaPlan.data,
    }),
  })

  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'organization',
    entityId: organization.id,
    embedding: args.embedding,
    nestedCandidates: [
      ...ownersPlan.createdEmbeddingCandidates,
      ...executivesPlan.createdEmbeddingCandidates,
    ],
  })
  return organization
}

export async function createProduct(args: {
  ctx: GraphQLContext
  data: ProductCreateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const product = await args.ctx.prisma.product.create({ data: args.data })
  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'product',
    entityId: product.id,
    embedding: args.embedding,
  })
  return product
}

export async function updateProduct(args: {
  ctx: GraphQLContext
  where: ProductWhereUniqueInput
  data: ProductUpdateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const mode = resolveEmbeddingWriteMode(args.embedding)
  const existing = await args.ctx.prisma.product.findUniqueOrThrow({
    where: resolveWhere(args.where),
  })
  const organizationPlan = await buildToOneRelationMutationPlan(
    asToOneRelationUpdateInput<OrganizationCreateInput>(args.data.organization),
    {
    prisma: args.ctx.prisma,
    searchableEntity: 'organization',
    mode,
  })
  const compoundsPlan = await buildToManyRelationMutationPlan(
    asToManyRelationUpdateInput<CompoundCreateInput>(args.data.containsCompounds),
    {
    prisma: args.ctx.prisma,
    searchableEntity: 'compound',
    mode,
  })
  const mediaPlan = await buildMediaToManyRelationMutationPlan(
    args.ctx.prisma,
    asMediaToManyRelationUpdateInput(args.data.media),
  )

  const product = await args.ctx.prisma.product.update({
    where: { id: existing.id },
    data: pickDefined({
      name: args.data.name,
      recommendedUse: applyNullableOp(args.data.recommendedUse),
      description: applyNullableOp(args.data.description),
      category: applyNullableOp(args.data.category),
      sku: applyNullableOp(args.data.sku),
      productUrl: applyNullableOp(args.data.productUrl),
      price: applyNullableOp(args.data.price),
      currency: applyNullableOp(args.data.currency),
      isActive: args.data.isActive,
      isLabTestPanelDefinition: args.data.isLabTestPanelDefinition,
      tags: args.data.tags ? { set: applyStringListOp(existing.tags, args.data.tags)! } : undefined,
      categories: args.data.categories
        ? { set: applyStringListOp(existing.categories, args.data.categories)! }
        : undefined,
      benefits: args.data.benefits
        ? { set: applyStringListOp(existing.benefits, args.data.benefits)! }
        : undefined,
      organization: organizationPlan.data,
      containsCompounds: compoundsPlan.data,
      media: mediaPlan.data,
    }),
  })

  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'product',
    entityId: product.id,
    embedding: args.embedding,
    nestedCandidates: [
      ...organizationPlan.createdEmbeddingCandidates,
      ...compoundsPlan.createdEmbeddingCandidates,
    ],
  })
  return product
}

export async function createCompound(args: {
  ctx: GraphQLContext
  data: CompoundCreateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const compound = await args.ctx.prisma.compound.create({ data: args.data })
  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'compound',
    entityId: compound.id,
    embedding: args.embedding,
  })
  return compound
}

export async function updateCompound(args: {
  ctx: GraphQLContext
  where: CompoundWhereUniqueInput
  data: CompoundUpdateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const existing = await args.ctx.prisma.compound.findUniqueOrThrow({
    where: resolveWhere(args.where),
  })
  const mediaPlan = await buildMediaToManyRelationMutationPlan(
    args.ctx.prisma,
    asMediaToManyRelationUpdateInput(args.data.media),
  )

  const compound = await args.ctx.prisma.compound.update({
    where: { id: existing.id },
    data: pickDefined({
      name: args.data.name,
      description: applyNullableOp(args.data.description),
      canonicalName: applyNullableOp(args.data.canonicalName),
      externalRef: applyNullableOp(args.data.externalRef),
      aliases: args.data.aliases
        ? { set: applyStringListOp(existing.aliases, args.data.aliases)! }
        : undefined,
      mechanisms: args.data.mechanisms
        ? { set: applyStringListOp(existing.mechanisms, args.data.mechanisms)! }
        : undefined,
      media: mediaPlan.data,
    }),
  })

  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'compound',
    entityId: compound.id,
    embedding: args.embedding,
  })
  return compound
}

export async function createLabTest(args: {
  ctx: GraphQLContext
  data: LabTestCreateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const labTest = await args.ctx.prisma.labTest.create({ data: args.data })
  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'labTest',
    entityId: labTest.id,
    embedding: args.embedding,
  })
  return labTest
}

export async function updateLabTest(args: {
  ctx: GraphQLContext
  where: LabTestWhereUniqueInput
  data: LabTestUpdateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const mode = resolveEmbeddingWriteMode(args.embedding)
  const existing = await args.ctx.prisma.labTest.findUniqueOrThrow({
    where: resolveWhere(args.where),
  })
  const productPlan = await buildToOneRelationMutationPlan(
    asToOneRelationUpdateInput<ProductCreateInput>(args.data.product),
    {
    prisma: args.ctx.prisma,
    searchableEntity: 'product',
    mode,
  })
  const organizationPlan = await buildToOneRelationMutationPlan(
    asToOneRelationUpdateInput<OrganizationCreateInput>(args.data.organization),
    {
    prisma: args.ctx.prisma,
    searchableEntity: 'organization',
    mode,
  })
  const biomarkersPlan = await buildToManyRelationMutationPlan(
    asToManyRelationUpdateInput<BiomarkerCreateInput>(args.data.testsBiomarkers),
    {
    prisma: args.ctx.prisma,
    searchableEntity: 'biomarker',
    mode,
  })
  const mediaPlan = await buildMediaToManyRelationMutationPlan(
    args.ctx.prisma,
    asMediaToManyRelationUpdateInput(args.data.media),
  )

  const labTest = await args.ctx.prisma.labTest.update({
    where: { id: existing.id },
    data: pickDefined({
      name: args.data.name,
      description: applyNullableOp(args.data.description),
      labName: applyNullableOp(args.data.labName),
      reportUrl: applyNullableOp(args.data.reportUrl),
      testedAt: applyNullableOp(args.data.testedAt),
      sampleType: applyNullableOp(args.data.sampleType),
      tags: args.data.tags ? { set: applyStringListOp(existing.tags, args.data.tags)! } : undefined,
      product: productPlan.data,
      organization: organizationPlan.data,
      testsBiomarkers: biomarkersPlan.data,
      media: mediaPlan.data,
    }),
  })

  const additionalTargets: Array<{ entity: EmbeddingSourceEntity; entityId: string }> = []
  if (productPlan.touched && existing.productId) {
    additionalTargets.push({
      entity: 'product',
      entityId: existing.productId,
    })
  }

  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'labTest',
    entityId: labTest.id,
    embedding: args.embedding,
    nestedCandidates: [
      ...productPlan.createdEmbeddingCandidates,
      ...organizationPlan.createdEmbeddingCandidates,
      ...biomarkersPlan.createdEmbeddingCandidates,
    ],
    additionalTargets,
  })
  return labTest
}

export async function createBiomarker(args: {
  ctx: GraphQLContext
  data: BiomarkerCreateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const biomarker = await args.ctx.prisma.biomarker.create({ data: args.data })
  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'biomarker',
    entityId: biomarker.id,
    embedding: args.embedding,
  })
  return biomarker
}

export async function updateBiomarker(args: {
  ctx: GraphQLContext
  where: BiomarkerWhereUniqueInput
  data: BiomarkerUpdateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const existing = await args.ctx.prisma.biomarker.findUniqueOrThrow({
    where: resolveWhere(args.where),
  })
  const mediaPlan = await buildMediaToManyRelationMutationPlan(
    args.ctx.prisma,
    asMediaToManyRelationUpdateInput(args.data.media),
  )

  const biomarker = await args.ctx.prisma.biomarker.update({
    where: { id: existing.id },
    data: pickDefined({
      name: args.data.name,
      description: applyNullableOp(args.data.description),
      unit: applyNullableOp(args.data.unit),
      category: applyNullableOp(args.data.category),
      referenceRange: applyNullableOp(args.data.referenceRange),
      referenceAgeMin: applyNullableOp(args.data.referenceAgeMin),
      referenceAgeMax: applyNullableOp(args.data.referenceAgeMax),
      referenceRangeLow: applyNullableOp(args.data.referenceRangeLow),
      referenceRangeMax: applyNullableOp(args.data.referenceRangeMax),
      aliases: args.data.aliases
        ? { set: applyStringListOp(existing.aliases, args.data.aliases)! }
        : undefined,
      relatedSystems: args.data.relatedSystems
        ? { set: applyStringListOp(existing.relatedSystems, args.data.relatedSystems)! }
        : undefined,
      media: mediaPlan.data,
    }),
  })

  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'biomarker',
    entityId: biomarker.id,
    embedding: args.embedding,
  })
  return biomarker
}

export async function createCaseStudy(args: {
  ctx: GraphQLContext
  data: CaseStudyCreateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const caseStudy = await args.ctx.prisma.caseStudy.create({ data: args.data })
  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'caseStudy',
    entityId: caseStudy.id,
    embedding: args.embedding,
  })
  return caseStudy
}

export async function updateCaseStudy(args: {
  ctx: GraphQLContext
  where: CaseStudyWhereUniqueInput
  data: CaseStudyUpdateInput
  embedding?: EmbeddingWriteOptions | null
}) {
  const mode = resolveEmbeddingWriteMode(args.embedding)
  const existing = await args.ctx.prisma.caseStudy.findUniqueOrThrow({
    where: resolveWhere(args.where),
  })
  const sponsorsPlan = await buildToManyRelationMutationPlan(
    asToManyRelationUpdateInput<OrganizationCreateInput>(args.data.businessSponsors),
    {
    prisma: args.ctx.prisma,
    searchableEntity: 'organization',
    mode,
  })
  const referencedPlan = await buildToManyRelationMutationPlan(
    asToManyRelationUpdateInput<OrganizationCreateInput>(args.data.referencedByOrganizations),
    {
    prisma: args.ctx.prisma,
    searchableEntity: 'organization',
    mode,
  })
  const mediaPlan = await buildMediaToManyRelationMutationPlan(
    args.ctx.prisma,
    asMediaToManyRelationUpdateInput(args.data.media),
  )

  const caseStudy = await args.ctx.prisma.caseStudy.update({
    where: { id: existing.id },
    data: pickDefined({
      title: args.data.title,
      description: applyNullableOp(args.data.description),
      studyType: applyNullableOp(args.data.studyType),
      publicationDate: applyNullableOp(args.data.publicationDate),
      sourceUrl: applyNullableOp(args.data.sourceUrl),
      doi: applyNullableOp(args.data.doi),
      journal: applyNullableOp(args.data.journal),
      outcomeSummary: applyNullableOp(args.data.outcomeSummary),
      fullTextSummary: applyNullableOp(args.data.fullTextSummary),
      tags: args.data.tags ? { set: applyStringListOp(existing.tags, args.data.tags)! } : undefined,
      keywords: args.data.keywords
        ? { set: applyStringListOp(existing.keywords, args.data.keywords)! }
        : undefined,
      businessSponsors: sponsorsPlan.data,
      referencedByOrganizations: referencedPlan.data,
      media: mediaPlan.data,
    }),
  })

  await runPostWriteEmbeddingSync({
    ctx: args.ctx,
    entity: 'caseStudy',
    entityId: caseStudy.id,
    embedding: args.embedding,
    nestedCandidates: [
      ...sponsorsPlan.createdEmbeddingCandidates,
      ...referencedPlan.createdEmbeddingCandidates,
    ],
  })
  return caseStudy
}
