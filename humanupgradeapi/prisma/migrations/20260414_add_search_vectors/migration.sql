-- Full-text search vectors for searchable tables (excluding Media and EmbeddingState).
-- Stored tsvector columns maintained by triggers: PostgreSQL rejects GENERATED columns here
-- because to_tsvector/array_to_string are STABLE, not IMMUTABLE.

-- ─────────────────────────────────────────────────────────────────────────────
-- Podcast
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "Podcast" ADD COLUMN "search_vector" tsvector;

UPDATE "Podcast" SET "search_vector" = (
  setweight(to_tsvector('simple', coalesce("title", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("subtitle", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("hostName", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("tags", ' '), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("description", '')), 'C') ||
  setweight(to_tsvector('simple', coalesce("language", '')), 'D')
);

CREATE INDEX "Podcast_search_vector_idx" ON "Podcast" USING GIN ("search_vector");

CREATE OR REPLACE FUNCTION podcast_search_vector_tg()
RETURNS TRIGGER AS $$
BEGIN
  NEW."search_vector" :=
    setweight(to_tsvector('simple', coalesce(NEW."title", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."subtitle", '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW."hostName", '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."tags", ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW."description", '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(NEW."language", '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER podcast_search_vector_trigger
BEFORE INSERT OR UPDATE ON "Podcast"
FOR EACH ROW
EXECUTE FUNCTION podcast_search_vector_tg();

-- ─────────────────────────────────────────────────────────────────────────────
-- Episode
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "Episode" ADD COLUMN "search_vector" tsvector;

UPDATE "Episode" SET "search_vector" = (
  setweight(to_tsvector('simple', coalesce("title", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("channelName", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("topicPrimary", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("topicSecondary", ' '), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("topicConcepts", ' '), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("tags", ' '), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("topics", ' '), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("keyTakeaways", ' '), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("summaryShort", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("publishedSummary", '')), 'A')
);

CREATE INDEX "Episode_search_vector_idx" ON "Episode" USING GIN ("search_vector");

CREATE OR REPLACE FUNCTION episode_search_vector_tg()
RETURNS TRIGGER AS $$
BEGIN
  NEW."search_vector" :=
    setweight(to_tsvector('simple', coalesce(NEW."title", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."channelName", '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW."topicPrimary", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."topicSecondary", ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."topicConcepts", ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."tags", ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."topics", ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."keyTakeaways", ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW."summaryShort", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."publishedSummary", '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER episode_search_vector_trigger
BEFORE INSERT OR UPDATE ON "Episode"
FOR EACH ROW
EXECUTE FUNCTION episode_search_vector_tg();

-- ─────────────────────────────────────────────────────────────────────────────
-- Claim
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "Claim" ADD COLUMN "search_vector" tsvector;

UPDATE "Claim" SET "search_vector" = (
  setweight(to_tsvector('simple', coalesce("text", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("evidenceExcerpt", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("tags", ' '), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("claimType"::text, '')), 'C') ||
  setweight(to_tsvector('simple', coalesce("stance"::text, '')), 'D') ||
  setweight(to_tsvector('simple', coalesce("claimConfidence"::text, '')), 'D')
);

CREATE INDEX "Claim_search_vector_idx" ON "Claim" USING GIN ("search_vector");

CREATE OR REPLACE FUNCTION claim_search_vector_tg()
RETURNS TRIGGER AS $$
BEGIN
  NEW."search_vector" :=
    setweight(to_tsvector('simple', coalesce(NEW."text", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."evidenceExcerpt", '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."tags", ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW."claimType"::text, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(NEW."stance"::text, '')), 'D') ||
    setweight(to_tsvector('simple', coalesce(NEW."claimConfidence"::text, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER claim_search_vector_trigger
BEFORE INSERT OR UPDATE ON "Claim"
FOR EACH ROW
EXECUTE FUNCTION claim_search_vector_tg();

-- ─────────────────────────────────────────────────────────────────────────────
-- Person
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "Person" ADD COLUMN "search_vector" tsvector;

UPDATE "Person" SET "search_vector" = (
  setweight(to_tsvector('simple', coalesce("fullName", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("firstName", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("lastName", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("aliases", ' '), '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("title", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("expertiseAreas", ' '), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("bio", '')), 'C')
);

CREATE INDEX "Person_search_vector_idx" ON "Person" USING GIN ("search_vector");

CREATE OR REPLACE FUNCTION person_search_vector_tg()
RETURNS TRIGGER AS $$
BEGIN
  NEW."search_vector" :=
    setweight(to_tsvector('simple', coalesce(NEW."fullName", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."firstName", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."lastName", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."aliases", ' '), '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."title", '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."expertiseAreas", ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW."bio", '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER person_search_vector_trigger
BEFORE INSERT OR UPDATE ON "Person"
FOR EACH ROW
EXECUTE FUNCTION person_search_vector_tg();

-- ─────────────────────────────────────────────────────────────────────────────
-- Organization
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "Organization" ADD COLUMN "search_vector" tsvector;

UPDATE "Organization" SET "search_vector" = (
  setweight(to_tsvector('simple', coalesce("name", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("legalName", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("aliases", ' '), '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("stockTicker", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("domains", ' '), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("organizationType"::text, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("tags", ' '), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("headquarters", '')), 'C') ||
  setweight(to_tsvector('simple', coalesce("description", '')), 'C')
);

CREATE INDEX "Organization_search_vector_idx" ON "Organization" USING GIN ("search_vector");

CREATE OR REPLACE FUNCTION organization_search_vector_tg()
RETURNS TRIGGER AS $$
BEGIN
  NEW."search_vector" :=
    setweight(to_tsvector('simple', coalesce(NEW."name", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."legalName", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."aliases", ' '), '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."stockTicker", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."domains", ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW."organizationType"::text, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."tags", ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW."headquarters", '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(NEW."description", '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organization_search_vector_trigger
BEFORE INSERT OR UPDATE ON "Organization"
FOR EACH ROW
EXECUTE FUNCTION organization_search_vector_tg();

-- ─────────────────────────────────────────────────────────────────────────────
-- Product
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "Product" ADD COLUMN "search_vector" tsvector;

UPDATE "Product" SET "search_vector" = (
  setweight(to_tsvector('simple', coalesce("name", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("sku", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("category", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("categories", ' '), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("tags", ' '), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("benefits", ' '), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("recommendedUse", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("currency", '')), 'D') ||
  setweight(to_tsvector('simple', coalesce("description", '')), 'C')
);

CREATE INDEX "Product_search_vector_idx" ON "Product" USING GIN ("search_vector");

CREATE OR REPLACE FUNCTION product_search_vector_tg()
RETURNS TRIGGER AS $$
BEGIN
  NEW."search_vector" :=
    setweight(to_tsvector('simple', coalesce(NEW."name", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."sku", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."category", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."categories", ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."tags", ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."benefits", ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW."recommendedUse", '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW."currency", '')), 'D') ||
    setweight(to_tsvector('simple', coalesce(NEW."description", '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_search_vector_trigger
BEFORE INSERT OR UPDATE ON "Product"
FOR EACH ROW
EXECUTE FUNCTION product_search_vector_tg();

-- ─────────────────────────────────────────────────────────────────────────────
-- Compound
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "Compound" ADD COLUMN "search_vector" tsvector;

UPDATE "Compound" SET "search_vector" = (
  setweight(to_tsvector('simple', coalesce("name", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("canonicalName", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("externalRef", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("aliases", ' '), '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("mechanisms", ' '), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("description", '')), 'C')
);

CREATE INDEX "Compound_search_vector_idx" ON "Compound" USING GIN ("search_vector");

CREATE OR REPLACE FUNCTION compound_search_vector_tg()
RETURNS TRIGGER AS $$
BEGIN
  NEW."search_vector" :=
    setweight(to_tsvector('simple', coalesce(NEW."name", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."canonicalName", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."externalRef", '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."aliases", ' '), '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."mechanisms", ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW."description", '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compound_search_vector_trigger
BEFORE INSERT OR UPDATE ON "Compound"
FOR EACH ROW
EXECUTE FUNCTION compound_search_vector_tg();

-- ─────────────────────────────────────────────────────────────────────────────
-- LabTest
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "LabTest" ADD COLUMN "search_vector" tsvector;

UPDATE "LabTest" SET "search_vector" = (
  setweight(to_tsvector('simple', coalesce("name", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("labName", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("sampleType", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("tags", ' '), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("description", '')), 'C')
);

CREATE INDEX "LabTest_search_vector_idx" ON "LabTest" USING GIN ("search_vector");

CREATE OR REPLACE FUNCTION lab_test_search_vector_tg()
RETURNS TRIGGER AS $$
BEGIN
  NEW."search_vector" :=
    setweight(to_tsvector('simple', coalesce(NEW."name", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."labName", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."sampleType", '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."tags", ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW."description", '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lab_test_search_vector_trigger
BEFORE INSERT OR UPDATE ON "LabTest"
FOR EACH ROW
EXECUTE FUNCTION lab_test_search_vector_tg();

-- ─────────────────────────────────────────────────────────────────────────────
-- Biomarker
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "Biomarker" ADD COLUMN "search_vector" tsvector;

UPDATE "Biomarker" SET "search_vector" = (
  setweight(to_tsvector('simple', coalesce("name", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("aliases", ' '), '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("category", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("unit", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("referenceRange", '')), 'C') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("relatedSystems", ' '), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("description", '')), 'C')
);

CREATE INDEX "Biomarker_search_vector_idx" ON "Biomarker" USING GIN ("search_vector");

CREATE OR REPLACE FUNCTION biomarker_search_vector_tg()
RETURNS TRIGGER AS $$
BEGIN
  NEW."search_vector" :=
    setweight(to_tsvector('simple', coalesce(NEW."name", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."aliases", ' '), '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."category", '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW."unit", '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW."referenceRange", '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."relatedSystems", ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW."description", '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER biomarker_search_vector_trigger
BEFORE INSERT OR UPDATE ON "Biomarker"
FOR EACH ROW
EXECUTE FUNCTION biomarker_search_vector_tg();

-- ─────────────────────────────────────────────────────────────────────────────
-- CaseStudy
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "CaseStudy" ADD COLUMN "search_vector" tsvector;

UPDATE "CaseStudy" SET "search_vector" = (
  setweight(to_tsvector('simple', coalesce("title", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("doi", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce("journal", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("studyType", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("tags", ' '), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(array_to_string("keywords", ' '), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("outcomeSummary", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("description", '')), 'C') ||
  setweight(to_tsvector('simple', coalesce("fullTextSummary", '')), 'D')
);

CREATE INDEX "CaseStudy_search_vector_idx" ON "CaseStudy" USING GIN ("search_vector");

CREATE OR REPLACE FUNCTION case_study_search_vector_tg()
RETURNS TRIGGER AS $$
BEGIN
  NEW."search_vector" :=
    setweight(to_tsvector('simple', coalesce(NEW."title", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."doi", '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."journal", '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW."studyType", '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."tags", ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW."keywords", ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW."outcomeSummary", '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW."description", '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(NEW."fullTextSummary", '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER case_study_search_vector_trigger
BEFORE INSERT OR UPDATE ON "CaseStudy"
FOR EACH ROW
EXECUTE FUNCTION case_study_search_vector_tg();
