# 08 — Data Model Additions

The current `humanupgradeapi` schema is a **public knowledge graph only**. To support the client features, we add a parallel **user-owned** layer. Nothing in the public layer changes (no breaking changes to existing GraphQL types).

All new models live in the same Postgres database, in the same Prisma schema. They get their own GraphQL types and resolvers, all gated by a `requireUser(ctx)` helper that resolves the authenticated user via Clerk's `auth()` and joins it to the local `User` row by `clerkId`.

---

## 1. New enums

```prisma
enum Goal {
  SLEEP
  COGNITION
  LONGEVITY
  ENERGY
  METABOLIC_HEALTH
  STRENGTH
  VO2_MAX
  STRESS
  BODY_COMPOSITION
  HORMONAL
  HRV
}

enum HealthFlag {
  PREGNANT
  POSTPARTUM
  POSTMENOPAUSAL
  ON_MEDICATION
  HYPERTENSION
  DIABETES_T1
  DIABETES_T2
  PRE_DIABETIC
  THYROID_DISORDER
  AUTOIMMUNE
  VEGETARIAN
  VEGAN
  KIDNEY_DISEASE
  LIVER_DISEASE
  CARDIOVASCULAR_DISEASE
}

enum TimeLayer {
  CONTINUOUS
  MINUTE
  HOURLY
  DAILY
  WEEKLY
  MONTHLY
  QUARTERLY
  ANNUAL
}

enum ProtocolStatus {
  DRAFT
  ACTIVE
  PAUSED
  ARCHIVED
}

enum ProofRequirement {
  NONE
  CHECKIN
  PHOTO
  FILE
  SYNC
}

enum BiomarkerSource {
  MANUAL
  CSV
  LAB_PDF
  OURA
  WHOOP
  APPLE_HEALTH
  DEXCOM
  GARMIN
  EIGHT_SLEEP
  OTHER
}

enum SavedEntityType {
  PODCAST
  EPISODE
  CLAIM
  PERSON
  ORGANIZATION
  PRODUCT
  COMPOUND
  LAB_TEST
  BIOMARKER
  CASE_STUDY
}

enum HighlightSourceType {
  EPISODE_TRANSCRIPT
  CLAIM
  CASE_STUDY
  NOTE
  USER_FILE
}

enum FileKind {
  CASE_STUDY_PDF
  LAB_PDF
  IMAGE
  AUDIO
  VIDEO
  TEXT
  OTHER
}

enum AssistantRole {
  USER
  ASSISTANT
  TOOL
  SYSTEM
}

enum XpReason {
  ONBOARDING_STEP
  SAVE_ENTITY
  CREATE_NOTE
  CREATE_HIGHLIGHT
  ENTITY_MENTION
  CREATE_PROTOCOL
  ADD_PROTOCOL_STEP
  COMPLETE_STEP
  COMPLETE_STEP_PROOF
  SYNC_READING
  LOG_READING
  STREAK_7
  STREAK_30
  QUEST_COMPLETE
  LEVEL_UP_BONUS
  ASSISTANT_GRANT
}

enum QuestStatus { LOCKED ACTIVE COMPLETED ABANDONED }
```

---

## 2. User & profile

We use **Clerk** for authentication. The local `User` row is a thin mirror keyed by `clerkId` — Clerk owns email verification, sessions, MFA, OAuth providers, etc. A Clerk webhook (`app/api/webhooks/clerk/route.ts`) keeps the mirror fresh on `user.created`, `user.updated`, `user.deleted`. The local `User.id` (cuid) is the FK target for every other user-owned table.

```prisma
model User {
  id             String   @id @default(cuid())
  clerkId        String   @unique                 // Clerk's user_xxx id
  email          String   @unique
  name           String?
  image          String?

  profile        UserProfile?

  // owned collections
  savedEntities    SavedEntity[]
  notes            Note[]
  highlights       Highlight[]
  files            UserFile[]
  folders          Folder[]
  protocols        Protocol[]
  userBiomarkers   UserBiomarker[]
  biomarkerReadings BiomarkerReading[]
  assistantThreads AssistantThread[]
  xpEvents         XpEvent[]
  userQuests       UserQuest[]
  userBadges       UserBadge[]
  paneLayouts      PaneLayout[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@index([clerkId])
}

model UserProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  primaryGoal     Goal
  secondaryGoals  Goal[]   @default([])
  healthFlags     HealthFlag[] @default([])

  ageYears        Int?
  sex             String?
  heightCm        Float?
  weightKg        Float?
  timeZone        String?  // IANA

  whyNow          String?  // freeform; used by assistant

  // NOTE: long-term assistant memory is NOT stored here.
  // It lives in Mem0 (scoped by user_id = User.id). See `lib/memory/mem0.ts`
  // and Settings → Memory for the editable surface.

  level           Int      @default(1)
  xp              Int      @default(0)
  onboardedAt     DateTime?

  notificationPrefs Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 3. Saves, notes, highlights, files

`SavedEntity` is a **polymorphic save** — we use a discriminator + scoped FK columns, mirroring how `Media` already does it in this schema.

```prisma
model Folder {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  parentId  String?
  parent    Folder? @relation("FolderTree", fields: [parentId], references: [id])
  children  Folder[] @relation("FolderTree")
  color     String?

  savedEntities SavedEntity[]
  notes         Note[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, name, parentId])
  @@index([userId])
}

model SavedEntity {
  id         String           @id @default(cuid())
  userId     String
  user       User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  entityType SavedEntityType
  // exactly one of these is non-null:
  podcastId      String?
  episodeId      String?
  claimId        String?
  personId       String?
  organizationId String?
  productId      String?
  compoundId     String?
  labTestId      String?
  biomarkerId    String?
  caseStudyId    String?

  podcast      Podcast?      @relation(fields: [podcastId], references: [id], onDelete: Cascade)
  episode      Episode?      @relation(fields: [episodeId], references: [id], onDelete: Cascade)
  claim        Claim?        @relation(fields: [claimId], references: [id], onDelete: Cascade)
  person       Person?       @relation(fields: [personId], references: [id], onDelete: Cascade)
  organization Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  product      Product?      @relation(fields: [productId], references: [id], onDelete: Cascade)
  compound     Compound?     @relation(fields: [compoundId], references: [id], onDelete: Cascade)
  labTest      LabTest?      @relation(fields: [labTestId], references: [id], onDelete: Cascade)
  biomarker    Biomarker?    @relation(fields: [biomarkerId], references: [id], onDelete: Cascade)
  caseStudy    CaseStudy?    @relation(fields: [caseStudyId], references: [id], onDelete: Cascade)

  folderId  String?
  folder    Folder?  @relation(fields: [folderId], references: [id], onDelete: SetNull)
  tags      String[] @default([])
  note      String?

  createdAt DateTime @default(now())

  @@unique([userId, entityType, podcastId, episodeId, claimId, personId, organizationId, productId, compoundId, labTestId, biomarkerId, caseStudyId])
  @@index([userId, entityType])
  @@index([userId, folderId])
}

model Note {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  markdown  String
  folderId  String?
  folder    Folder?  @relation(fields: [folderId], references: [id], onDelete: SetNull)
  tags      String[] @default([])

  // freeform mention graph extracted from @-mentions on save:
  mentionedEntities Json @default("[]") // [{ type, id }]

  embedding    Unsupported("vector")?
  searchVector Unsupported("tsvector")? @map("search_vector")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([userId, folderId])
  @@index([searchVector], type: Gin, map: "Note_search_vector_idx")
}

model Highlight {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sourceType   HighlightSourceType

  // exactly one of these is non-null
  episodeId    String?
  episode      Episode? @relation(fields: [episodeId], references: [id], onDelete: Cascade)
  claimId      String?
  claim        Claim?   @relation(fields: [claimId], references: [id], onDelete: Cascade)
  caseStudyId  String?
  caseStudy    CaseStudy? @relation(fields: [caseStudyId], references: [id], onDelete: Cascade)
  noteId       String?
  note         Note?    @relation(fields: [noteId], references: [id], onDelete: Cascade)
  userFileId   String?
  userFile     UserFile? @relation(fields: [userFileId], references: [id], onDelete: Cascade)

  text         String
  charStart    Int?
  charEnd      Int?
  // for episode transcripts also store time anchors when available:
  startTimeSeconds Int?
  endTimeSeconds   Int?

  noteText     String?  // user's commentary on the highlight
  color        String?

  embedding    Unsupported("vector")?

  createdAt DateTime @default(now())

  @@index([userId, sourceType])
  @@index([episodeId])
  @@index([claimId])
  @@index([caseStudyId])
}

model UserFile {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  kind       FileKind
  fileName   String
  mimeType   String
  sizeBytes  Int
  s3Bucket   String
  s3Key      String
  url        String?  // signed; refreshed
  parsedText String?  // populated async after parse
  parsedAt   DateTime?

  highlights Highlight[]

  createdAt DateTime @default(now())

  @@index([userId, kind])
}
```

> Note: we add inverse relations on the existing public models (`Episode.savedBy`, `Compound.savedBy`, `Episode.highlights`, etc.). Those are pure additions — no breaking changes.

---

## 4. Protocols

```prisma
model Protocol {
  id          String         @id @default(cuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  description String?
  goals       Goal[]         @default([])
  status      ProtocolStatus @default(DRAFT)
  startDate   DateTime?
  endDate     DateTime?

  // assistant attribution
  generatedByAssistant Boolean       @default(false)
  generatedFromThreadId String?
  generatedFromThread   AssistantThread? @relation(fields: [generatedFromThreadId], references: [id], onDelete: SetNull)

  steps       ProtocolStep[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, status])
}

model ProtocolStep {
  id           String           @id @default(cuid())
  protocolId   String
  protocol     Protocol         @relation(fields: [protocolId], references: [id], onDelete: Cascade)
  title        String
  description  String?
  layer        TimeLayer
  cadence      Json             // see Cadence type in doc 06
  proofRequirement ProofRequirement @default(CHECKIN)
  expectedOutcome  String?
  metricUserBiomarkerId String?
  metricUserBiomarker   UserBiomarker? @relation(fields: [metricUserBiomarkerId], references: [id], onDelete: SetNull)

  // links into the public graph (M:N each via implicit join tables)
  linkedCompounds  Compound[]   @relation("ProtocolStepCompounds")
  linkedProducts   Product[]    @relation("ProtocolStepProducts")
  linkedBiomarkers Biomarker[]  @relation("ProtocolStepBiomarkers")
  linkedEpisodes   Episode[]    @relation("ProtocolStepEpisodes")
  linkedCaseStudies CaseStudy[] @relation("ProtocolStepCaseStudies")
  linkedClaims     Claim[]      @relation("ProtocolStepClaims")

  sortOrder    Int              @default(0)

  checkIns     ProtocolStepCheckIn[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([protocolId, layer])
}

model ProtocolStepCheckIn {
  id            String        @id @default(cuid())
  stepId        String
  step          ProtocolStep  @relation(fields: [stepId], references: [id], onDelete: Cascade)
  userId        String
  scheduledFor  DateTime?
  completedAt   DateTime      @default(now())
  proofUserFileId String?
  note          String?
  source        BiomarkerSource @default(MANUAL)  // 'sync' fills this

  @@index([stepId, completedAt])
  @@index([userId, completedAt])
}
```

---

## 5. Biomarker tracking

```prisma
model UserBiomarker {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // exactly one of these is set
  biomarkerId String?
  biomarker   Biomarker? @relation(fields: [biomarkerId], references: [id], onDelete: SetNull)

  // present only when custom (biomarkerId is null)
  customName        String?
  customUnit        String?
  customCategory    String?
  customRefRangeLow Float?
  customRefRangeHigh Float?

  isPrimary   Boolean  @default(false)
  pinned      Boolean  @default(true)
  notes       String?

  readings    BiomarkerReading[]
  protocolSteps ProtocolStep[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, biomarkerId])
  @@index([userId])
}

model BiomarkerReading {
  id              String           @id @default(cuid())
  userBiomarkerId String
  userBiomarker   UserBiomarker    @relation(fields: [userBiomarkerId], references: [id], onDelete: Cascade)
  userId          String
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  value     Float
  unit      String?
  takenAt   DateTime
  source    BiomarkerSource @default(MANUAL)
  rawSourcePayload Json?
  note      String?

  // optional attribution to active steps at time of reading
  attributedStepIds String[] @default([])

  createdAt DateTime @default(now())

  @@index([userBiomarkerId, takenAt])
  @@index([userId, takenAt])
}
```

---

## 6. Assistant

```prisma
model AssistantThread {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String?
  memory    String?           // running summary
  archived  Boolean          @default(false)

  messages  AssistantMessage[]
  protocolsGenerated Protocol[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, updatedAt])
}

model AssistantMessage {
  id         String   @id @default(cuid())
  threadId   String
  thread     AssistantThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  role       AssistantRole
  content    Json     // structured: text parts + tool calls + tool results + attachments
  modelName  String?
  inputTokens  Int?
  outputTokens Int?
  costUsd      Float?

  createdAt DateTime @default(now())

  @@index([threadId, createdAt])
}
```

---

## 7. Gamification

```prisma
model XpEvent {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  reason    XpReason
  amount    Int
  // optional ref to what caused it:
  refType   String?
  refId     String?
  metadata  Json?

  createdAt DateTime @default(now())

  @@index([userId, createdAt])
  @@index([userId, reason])
}

model Quest {
  id            String     @id @default(cuid())
  slug          String     @unique
  title         String
  narrative     String
  steps         Json       // QuestStep[]
  xpReward      Int
  badgeRewardSlug String?
  prerequisiteLevel Int?
  unlockCondition String?
  version       Int        @default(1)

  userQuests    UserQuest[]
}

model UserQuest {
  id        String      @id @default(cuid())
  userId    String
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  questId   String
  quest     Quest       @relation(fields: [questId], references: [id], onDelete: Cascade)
  status    QuestStatus @default(ACTIVE)
  progress  Json        @default("{}")  // { stepId: { completed: bool, completedAt? } }
  completedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, questId])
  @@index([userId, status])
}

model Badge {
  id    String  @id @default(cuid())
  slug  String  @unique
  name  String
  description String
  iconKey String

  userBadges UserBadge[]
}

model UserBadge {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  badgeId   String
  badge     Badge   @relation(fields: [badgeId], references: [id], onDelete: Cascade)
  awardedAt DateTime @default(now())

  @@unique([userId, badgeId])
}
```

---

## 8. UI state (optional but nice)

```prisma
model PaneLayout {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  routeKey  String   // normalized path, e.g. "/e/episodes"
  layout    Json     // { left, center, right, ratios, collapsed }

  updatedAt DateTime @updatedAt

  @@unique([userId, routeKey])
}
```

---

## 9. GraphQL surface deltas

For each new model, add:

- a GraphQL `type` (camelCase, scalar relations as field resolvers using DataLoader)
- a `Query.<model>` for single fetch by id, and a `Query.<model>s` with pagination
- mutations: `createX`, `updateX`, `deleteX` plus model-specific (`completeProtocolStep`, `logBiomarkerReading`, `awardXp`, `acceptQuest`, etc.)
- always require `requireUser(ctx)` — the existing context object becomes:

```ts
type GraphQLContext = {
  prisma: PrismaClient
  loaders: Loaders
  user: { id: string, email: string } | null
}
```

A `requireUser(ctx)` helper throws `GraphQLError('UNAUTHENTICATED')` when `user` is null.

---

## 10. Migration strategy

1. PR 1 — add `User`, `UserProfile`, `Folder`, `SavedEntity`, `Note`, `Highlight`, `UserFile`. No public-graph changes.
2. PR 2 — add `Protocol`, `ProtocolStep`, `ProtocolStepCheckIn`, `UserBiomarker`, `BiomarkerReading`. Adds inverse relations to `Compound`, `Product`, `Biomarker`, `Episode`, `CaseStudy`, `Claim` (back-relations only, no required fields).
3. PR 3 — `AssistantThread`, `AssistantMessage`.
4. PR 4 — `XpEvent`, `Quest`, `UserQuest`, `Badge`, `UserBadge`.
5. PR 5 — `PaneLayout`.

Each PR is shippable independently because the client is built in feature-flagged slices.
