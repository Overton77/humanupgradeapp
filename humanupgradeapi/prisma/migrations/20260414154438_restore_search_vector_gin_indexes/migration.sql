-- CreateIndex
CREATE INDEX "Biomarker_search_vector_idx" ON "Biomarker" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "CaseStudy_search_vector_idx" ON "CaseStudy" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "Claim_search_vector_idx" ON "Claim" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "Compound_search_vector_idx" ON "Compound" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "Episode_search_vector_idx" ON "Episode" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "LabTest_search_vector_idx" ON "LabTest" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "Organization_search_vector_idx" ON "Organization" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "Person_search_vector_idx" ON "Person" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "Podcast_search_vector_idx" ON "Podcast" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "Product_search_vector_idx" ON "Product" USING GIN ("search_vector");
