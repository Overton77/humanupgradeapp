-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'LINK', 'OTHER');

-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('FACTUAL', 'CAUSAL', 'MECHANISTIC', 'STATISTICAL', 'ANECDOTAL', 'RECOMMENDATION', 'SAFETY_RISK', 'OTHER');

-- CreateEnum
CREATE TYPE "ClaimStance" AS ENUM ('SUPPORTS', 'OPPOSES', 'ASSERTED', 'NEUTRAL', 'MIXED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ClaimConfidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('BRAND', 'MANUFACTURER', 'RETAILER', 'LAB', 'CLINIC', 'RESEARCH_INSTITUTION', 'NONPROFIT', 'MEDIA', 'SPONSOR', 'HOLDING_COMPANY', 'OTHER');

-- CreateEnum
CREATE TYPE "TranscriptStatus" AS ENUM ('MISSING', 'QUEUED', 'STORED', 'ERROR');

-- CreateEnum
CREATE TYPE "PipelineStatus" AS ENUM ('NOT_STARTED', 'RUNNING', 'COMPLETE', 'ERROR');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('HIDDEN', 'READY');

-- CreateTable
CREATE TABLE "Podcast" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "rssUrl" TEXT,
    "websiteUrl" TEXT,
    "hostName" TEXT,
    "language" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Podcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "podcastId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "episodeNumber" INTEGER,
    "seasonNumber" INTEGER,
    "channelName" TEXT,
    "summary" TEXT,
    "description" TEXT,
    "transcript" TEXT,
    "transcriptSourceUrl" TEXT,
    "audioUrl" TEXT,
    "videoUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "webPageSummary" TEXT,
    "summaryShort" TEXT,
    "summaryDetailed" TEXT,
    "publishedSummary" TEXT,
    "episodePageUrl" TEXT,
    "episodeTranscriptUrl" TEXT,
    "youtubeVideoId" TEXT,
    "youtubeEmbedUrl" TEXT,
    "youtubeWatchUrl" TEXT,
    "s3TranscriptKey" TEXT,
    "s3TranscriptUrl" TEXT,
    "transcriptStatus" "TranscriptStatus" NOT NULL DEFAULT 'MISSING',
    "transcriptSha256" TEXT,
    "transcriptLastAttemptAt" TIMESTAMP(3),
    "transcriptErrorMessage" TEXT,
    "transcriptErrorAt" TIMESTAMP(3),
    "transcriptStorageProvider" TEXT,
    "transcriptStorageBucket" TEXT,
    "transcriptStorageKey" TEXT,
    "topicPrimary" TEXT,
    "topicSecondary" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "topicConcepts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "enrichmentStage1Status" "PipelineStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "enrichmentStage1CompletedAt" TIMESTAMP(3),
    "enrichmentStage1RunId" TEXT,
    "enrichmentStage2Status" "PipelineStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "enrichmentStage2CompletedAt" TIMESTAMP(3),
    "enrichmentStage2RunId" TEXT,
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'HIDDEN',
    "webPageTimelines" JSONB,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keyTakeaways" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "speakerId" TEXT,
    "text" TEXT NOT NULL,
    "evidenceExcerpt" TEXT,
    "claimType" "ClaimType" NOT NULL DEFAULT 'OTHER',
    "stance" "ClaimStance" NOT NULL DEFAULT 'UNKNOWN',
    "claimConfidence" "ClaimConfidence" NOT NULL DEFAULT 'UNKNOWN',
    "startTimeSeconds" INTEGER,
    "endTimeSeconds" INTEGER,
    "sourceUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "evidenceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "title" TEXT,
    "bio" TEXT,
    "websiteUrl" TEXT,
    "linkedinUrl" TEXT,
    "xUrl" TEXT,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expertiseAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "description" TEXT,
    "websiteUrl" TEXT,
    "headquarters" TEXT,
    "foundedYear" INTEGER,
    "annualRevenue" DOUBLE PRECISION,
    "stockTicker" TEXT,
    "employeeCount" INTEGER,
    "organizationType" "OrganizationType" NOT NULL DEFAULT 'OTHER',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "domains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "organizationId" TEXT,
    "isLabTestPanelDefinition" BOOLEAN,
    "name" TEXT NOT NULL,
    "recommendedUse" TEXT,
    "description" TEXT,
    "category" TEXT,
    "sku" TEXT,
    "productUrl" TEXT,
    "price" DECIMAL(10,2),
    "currency" TEXT DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compound" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "canonicalName" TEXT,
    "externalRef" TEXT,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mechanisms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Compound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTest" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "productId" TEXT,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "labName" TEXT,
    "reportUrl" TEXT,
    "testedAt" TIMESTAMP(3),
    "sampleType" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Biomarker" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT,
    "category" TEXT,
    "referenceRange" TEXT,
    "referenceAgeMin" INTEGER,
    "referenceAgeMax" INTEGER,
    "referenceRangeLow" DOUBLE PRECISION,
    "referenceRangeMax" DOUBLE PRECISION,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedSystems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Biomarker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseStudy" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "studyType" TEXT,
    "publicationDate" TIMESTAMP(3),
    "sourceUrl" TEXT,
    "doi" TEXT,
    "journal" TEXT,
    "outcomeSummary" TEXT,
    "fullTextSummary" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "mimeType" TEXT,
    "title" TEXT,
    "altText" TEXT,
    "caption" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "durationSeconds" INTEGER,
    "fileSizeBytes" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "podcastId" TEXT,
    "episodeId" TEXT,
    "claimId" TEXT,
    "personId" TEXT,
    "organizationId" TEXT,
    "productId" TEXT,
    "compoundId" TEXT,
    "labTestId" TEXT,
    "biomarkerId" TEXT,
    "caseStudyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EpisodeSponsors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EpisodeSponsors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EpisodeGuests" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EpisodeGuests_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OrganizationOwners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrganizationOwners_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OrganizationExecutives" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrganizationExecutives_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CompoundToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CompoundToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LabTestBiomarkers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LabTestBiomarkers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CompoundBiomarkerAssociations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CompoundBiomarkerAssociations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CaseStudyBusinessSponsors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CaseStudyBusinessSponsors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OrganizationReferencedCaseStudies" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrganizationReferencedCaseStudies_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Podcast_slug_key" ON "Podcast"("slug");

-- CreateIndex
CREATE INDEX "Podcast_title_idx" ON "Podcast"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_slug_key" ON "Episode"("slug");

-- CreateIndex
CREATE INDEX "Episode_podcastId_idx" ON "Episode"("podcastId");

-- CreateIndex
CREATE INDEX "Episode_publishedAt_idx" ON "Episode"("publishedAt");

-- CreateIndex
CREATE INDEX "Episode_title_idx" ON "Episode"("title");

-- CreateIndex
CREATE INDEX "Episode_transcriptStatus_idx" ON "Episode"("transcriptStatus");

-- CreateIndex
CREATE INDEX "Episode_enrichmentStage1Status_idx" ON "Episode"("enrichmentStage1Status");

-- CreateIndex
CREATE INDEX "Episode_publishStatus_idx" ON "Episode"("publishStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_podcastId_episodeNumber_key" ON "Episode"("podcastId", "episodeNumber");

-- CreateIndex
CREATE INDEX "Claim_episodeId_idx" ON "Claim"("episodeId");

-- CreateIndex
CREATE INDEX "Claim_speakerId_idx" ON "Claim"("speakerId");

-- CreateIndex
CREATE INDEX "Claim_claimType_idx" ON "Claim"("claimType");

-- CreateIndex
CREATE INDEX "Claim_stance_idx" ON "Claim"("stance");

-- CreateIndex
CREATE UNIQUE INDEX "Person_slug_key" ON "Person"("slug");

-- CreateIndex
CREATE INDEX "Person_fullName_idx" ON "Person"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name");

-- CreateIndex
CREATE INDEX "Organization_organizationType_idx" ON "Organization"("organizationType");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_organizationId_idx" ON "Product"("organizationId");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_organizationId_name_key" ON "Product"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Compound_slug_key" ON "Compound"("slug");

-- CreateIndex
CREATE INDEX "Compound_name_idx" ON "Compound"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LabTest_slug_key" ON "LabTest"("slug");

-- CreateIndex
CREATE INDEX "LabTest_productId_idx" ON "LabTest"("productId");

-- CreateIndex
CREATE INDEX "LabTest_organizationId_idx" ON "LabTest"("organizationId");

-- CreateIndex
CREATE INDEX "LabTest_testedAt_idx" ON "LabTest"("testedAt");

-- CreateIndex
CREATE INDEX "LabTest_name_idx" ON "LabTest"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Biomarker_slug_key" ON "Biomarker"("slug");

-- CreateIndex
CREATE INDEX "Biomarker_name_idx" ON "Biomarker"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CaseStudy_slug_key" ON "CaseStudy"("slug");

-- CreateIndex
CREATE INDEX "CaseStudy_title_idx" ON "CaseStudy"("title");

-- CreateIndex
CREATE INDEX "CaseStudy_publicationDate_idx" ON "CaseStudy"("publicationDate");

-- CreateIndex
CREATE INDEX "CaseStudy_doi_idx" ON "CaseStudy"("doi");

-- CreateIndex
CREATE INDEX "Media_podcastId_idx" ON "Media"("podcastId");

-- CreateIndex
CREATE INDEX "Media_episodeId_idx" ON "Media"("episodeId");

-- CreateIndex
CREATE INDEX "Media_claimId_idx" ON "Media"("claimId");

-- CreateIndex
CREATE INDEX "Media_personId_idx" ON "Media"("personId");

-- CreateIndex
CREATE INDEX "Media_organizationId_idx" ON "Media"("organizationId");

-- CreateIndex
CREATE INDEX "Media_productId_idx" ON "Media"("productId");

-- CreateIndex
CREATE INDEX "Media_compoundId_idx" ON "Media"("compoundId");

-- CreateIndex
CREATE INDEX "Media_labTestId_idx" ON "Media"("labTestId");

-- CreateIndex
CREATE INDEX "Media_biomarkerId_idx" ON "Media"("biomarkerId");

-- CreateIndex
CREATE INDEX "Media_caseStudyId_idx" ON "Media"("caseStudyId");

-- CreateIndex
CREATE INDEX "Media_type_idx" ON "Media"("type");

-- CreateIndex
CREATE INDEX "_EpisodeSponsors_B_index" ON "_EpisodeSponsors"("B");

-- CreateIndex
CREATE INDEX "_EpisodeGuests_B_index" ON "_EpisodeGuests"("B");

-- CreateIndex
CREATE INDEX "_OrganizationOwners_B_index" ON "_OrganizationOwners"("B");

-- CreateIndex
CREATE INDEX "_OrganizationExecutives_B_index" ON "_OrganizationExecutives"("B");

-- CreateIndex
CREATE INDEX "_CompoundToProduct_B_index" ON "_CompoundToProduct"("B");

-- CreateIndex
CREATE INDEX "_LabTestBiomarkers_B_index" ON "_LabTestBiomarkers"("B");

-- CreateIndex
CREATE INDEX "_CompoundBiomarkerAssociations_B_index" ON "_CompoundBiomarkerAssociations"("B");

-- CreateIndex
CREATE INDEX "_CaseStudyBusinessSponsors_B_index" ON "_CaseStudyBusinessSponsors"("B");

-- CreateIndex
CREATE INDEX "_OrganizationReferencedCaseStudies_B_index" ON "_OrganizationReferencedCaseStudies"("B");

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_compoundId_fkey" FOREIGN KEY ("compoundId") REFERENCES "Compound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_labTestId_fkey" FOREIGN KEY ("labTestId") REFERENCES "LabTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_biomarkerId_fkey" FOREIGN KEY ("biomarkerId") REFERENCES "Biomarker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_caseStudyId_fkey" FOREIGN KEY ("caseStudyId") REFERENCES "CaseStudy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EpisodeSponsors" ADD CONSTRAINT "_EpisodeSponsors_A_fkey" FOREIGN KEY ("A") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EpisodeSponsors" ADD CONSTRAINT "_EpisodeSponsors_B_fkey" FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EpisodeGuests" ADD CONSTRAINT "_EpisodeGuests_A_fkey" FOREIGN KEY ("A") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EpisodeGuests" ADD CONSTRAINT "_EpisodeGuests_B_fkey" FOREIGN KEY ("B") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationOwners" ADD CONSTRAINT "_OrganizationOwners_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationOwners" ADD CONSTRAINT "_OrganizationOwners_B_fkey" FOREIGN KEY ("B") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationExecutives" ADD CONSTRAINT "_OrganizationExecutives_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationExecutives" ADD CONSTRAINT "_OrganizationExecutives_B_fkey" FOREIGN KEY ("B") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompoundToProduct" ADD CONSTRAINT "_CompoundToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Compound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompoundToProduct" ADD CONSTRAINT "_CompoundToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabTestBiomarkers" ADD CONSTRAINT "_LabTestBiomarkers_A_fkey" FOREIGN KEY ("A") REFERENCES "Biomarker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabTestBiomarkers" ADD CONSTRAINT "_LabTestBiomarkers_B_fkey" FOREIGN KEY ("B") REFERENCES "LabTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompoundBiomarkerAssociations" ADD CONSTRAINT "_CompoundBiomarkerAssociations_A_fkey" FOREIGN KEY ("A") REFERENCES "Biomarker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompoundBiomarkerAssociations" ADD CONSTRAINT "_CompoundBiomarkerAssociations_B_fkey" FOREIGN KEY ("B") REFERENCES "Compound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseStudyBusinessSponsors" ADD CONSTRAINT "_CaseStudyBusinessSponsors_A_fkey" FOREIGN KEY ("A") REFERENCES "CaseStudy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseStudyBusinessSponsors" ADD CONSTRAINT "_CaseStudyBusinessSponsors_B_fkey" FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationReferencedCaseStudies" ADD CONSTRAINT "_OrganizationReferencedCaseStudies_A_fkey" FOREIGN KEY ("A") REFERENCES "CaseStudy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationReferencedCaseStudies" ADD CONSTRAINT "_OrganizationReferencedCaseStudies_B_fkey" FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

