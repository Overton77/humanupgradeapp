CREATE TYPE "EmbeddingStatus" AS ENUM ('MISSING', 'READY', 'STALE', 'ERROR');

CREATE TABLE "EmbeddingState" (
  "id" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "embeddingVersion" INTEGER NOT NULL,
  "contentHash" TEXT NOT NULL,
  "sourcePayloadJson" JSONB,
  "embeddingText" TEXT,
  "embeddingModel" TEXT,
  "embeddingStatus" "EmbeddingStatus" NOT NULL,
  "embeddedAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EmbeddingState_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmbeddingState_entityType_entityId_key"
  ON "EmbeddingState"("entityType", "entityId");

CREATE INDEX "EmbeddingState_entityType_embeddingStatus_idx"
  ON "EmbeddingState"("entityType", "embeddingStatus");

CREATE INDEX "EmbeddingState_entityType_embeddingVersion_idx"
  ON "EmbeddingState"("entityType", "embeddingVersion");
