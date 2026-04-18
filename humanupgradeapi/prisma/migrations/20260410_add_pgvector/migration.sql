CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "Podcast"
  ADD COLUMN "embedding" vector(1536);

ALTER TABLE "Episode"
  ADD COLUMN "embedding" vector(1536);

ALTER TABLE "Claim"
  ADD COLUMN "embedding" vector(1536);

ALTER TABLE "Person"
  ADD COLUMN "embedding" vector(1536);

ALTER TABLE "Organization"
  ADD COLUMN "embedding" vector(1536);

ALTER TABLE "Product"
  ADD COLUMN "embedding" vector(1536);

ALTER TABLE "Compound"
  ADD COLUMN "embedding" vector(1536);

ALTER TABLE "LabTest"
  ADD COLUMN "embedding" vector(1536);

ALTER TABLE "Biomarker"
  ADD COLUMN "embedding" vector(1536);

ALTER TABLE "CaseStudy"
  ADD COLUMN "embedding" vector(1536);