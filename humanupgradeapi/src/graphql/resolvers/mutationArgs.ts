import type { EmbeddingWriteOptionsInput } from '../../validation/embeddingWrite.js'
import type {
  BiomarkerCreateInput,
  BiomarkerUpdateInput,
  BiomarkerWhereUniqueInput,
} from '../../validation/biomarker.js'
import type {
  CaseStudyCreateInput,
  CaseStudyUpdateInput,
  CaseStudyWhereUniqueInput,
} from '../../validation/caseStudy.js'
import type {
  ClaimCreateInput,
  ClaimUpdateInput,
  ClaimWhereUniqueInput,
} from '../../validation/claim.js'
import type {
  CompoundCreateInput,
  CompoundUpdateInput,
  CompoundWhereUniqueInput,
} from '../../validation/compound.js'
import type {
  EpisodeCreateInput,
  EpisodeUpdateInput,
  EpisodeWhereUniqueInput,
} from '../../validation/episode.js'
import type {
  LabTestCreateInput,
  LabTestUpdateInput,
  LabTestWhereUniqueInput,
} from '../../validation/labTest.js'
import type {
  MediaCreateInput,
  MediaUpdateInput,
  MediaWhereUniqueInput,
} from '../../validation/media.js'
import type {
  OrganizationCreateInput,
  OrganizationUpdateInput,
  OrganizationWhereUniqueInput,
} from '../../validation/organization.js'
import type {
  PersonCreateInput,
  PersonUpdateInput,
  PersonWhereUniqueInput,
} from '../../validation/person.js'
import type {
  PodcastCreateInput,
  PodcastUpdateInput,
  PodcastWhereUniqueInput,
} from '../../validation/podcast.js'
import type {
  ProductCreateInput,
  ProductUpdateInput,
  ProductWhereUniqueInput,
} from '../../validation/product.js'

/** GraphQL embedding input (`embedding { mode }`) aligned with validation. */
export type EmbeddingMutationArg = {
  embedding?: EmbeddingWriteOptionsInput | null
}

// ─── Searchable entities (create/update take embedding) ─────────────────────

export type CreatePodcastMutationArgs = { data: PodcastCreateInput } & EmbeddingMutationArg
export type UpdatePodcastMutationArgs = {
  where: PodcastWhereUniqueInput
  data: PodcastUpdateInput
} & EmbeddingMutationArg
export type DeletePodcastMutationArgs = { where: PodcastWhereUniqueInput }

export type CreateEpisodeMutationArgs = { data: EpisodeCreateInput } & EmbeddingMutationArg
export type UpdateEpisodeMutationArgs = {
  where: EpisodeWhereUniqueInput
  data: EpisodeUpdateInput
} & EmbeddingMutationArg
export type DeleteEpisodeMutationArgs = { where: EpisodeWhereUniqueInput }

export type CreateClaimMutationArgs = { data: ClaimCreateInput } & EmbeddingMutationArg
export type UpdateClaimMutationArgs = {
  where: ClaimWhereUniqueInput
  data: ClaimUpdateInput
} & EmbeddingMutationArg
export type DeleteClaimMutationArgs = { where: ClaimWhereUniqueInput }

export type CreatePersonMutationArgs = { data: PersonCreateInput } & EmbeddingMutationArg
export type UpdatePersonMutationArgs = {
  where: PersonWhereUniqueInput
  data: PersonUpdateInput
} & EmbeddingMutationArg
export type DeletePersonMutationArgs = { where: PersonWhereUniqueInput }

export type CreateOrganizationMutationArgs = {
  data: OrganizationCreateInput
} & EmbeddingMutationArg
export type UpdateOrganizationMutationArgs = {
  where: OrganizationWhereUniqueInput
  data: OrganizationUpdateInput
} & EmbeddingMutationArg
export type DeleteOrganizationMutationArgs = { where: OrganizationWhereUniqueInput }

export type CreateProductMutationArgs = { data: ProductCreateInput } & EmbeddingMutationArg
export type UpdateProductMutationArgs = {
  where: ProductWhereUniqueInput
  data: ProductUpdateInput
} & EmbeddingMutationArg
export type DeleteProductMutationArgs = { where: ProductWhereUniqueInput }

export type CreateCompoundMutationArgs = { data: CompoundCreateInput } & EmbeddingMutationArg
export type UpdateCompoundMutationArgs = {
  where: CompoundWhereUniqueInput
  data: CompoundUpdateInput
} & EmbeddingMutationArg
export type DeleteCompoundMutationArgs = { where: CompoundWhereUniqueInput }

export type CreateLabTestMutationArgs = { data: LabTestCreateInput } & EmbeddingMutationArg
export type UpdateLabTestMutationArgs = {
  where: LabTestWhereUniqueInput
  data: LabTestUpdateInput
} & EmbeddingMutationArg
export type DeleteLabTestMutationArgs = { where: LabTestWhereUniqueInput }

export type CreateBiomarkerMutationArgs = { data: BiomarkerCreateInput } & EmbeddingMutationArg
export type UpdateBiomarkerMutationArgs = {
  where: BiomarkerWhereUniqueInput
  data: BiomarkerUpdateInput
} & EmbeddingMutationArg
export type DeleteBiomarkerMutationArgs = { where: BiomarkerWhereUniqueInput }

export type CreateCaseStudyMutationArgs = { data: CaseStudyCreateInput } & EmbeddingMutationArg
export type UpdateCaseStudyMutationArgs = {
  where: CaseStudyWhereUniqueInput
  data: CaseStudyUpdateInput
} & EmbeddingMutationArg
export type DeleteCaseStudyMutationArgs = { where: CaseStudyWhereUniqueInput }

// ─── Media (no embedding sync in resolver) ───────────────────────────────────

export type CreateMediaMutationArgs = { data: MediaCreateInput }
export type UpdateMediaMutationArgs = {
  where: MediaWhereUniqueInput
  data: MediaUpdateInput
}
export type DeleteMediaMutationArgs = { where: MediaWhereUniqueInput }
