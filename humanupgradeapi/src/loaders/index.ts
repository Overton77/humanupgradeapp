import type { PrismaClient } from '../../generated/client.js'
import { createPersonByIdLoader } from './personLoader.js'
import { createOrganizationByIdLoader } from './organizationLoader.js'
import { createProductByIdLoader, createProductsByOrganizationIdLoader } from './productLoader.js'
import { createCompoundByIdLoader } from './compoundLoader.js'
import { createBiomarkerByIdLoader } from './biomarkerLoader.js'
import { createCaseStudyByIdLoader } from './caseStudyLoader.js'
import { createClaimsByEpisodeIdLoader } from './claimLoader.js'
import {
  createGuestsByEpisodeIdLoader,
  createSponsorsByEpisodeIdLoader,
  createEpisodesByPodcastIdLoader,
} from './episodeRelationLoaders.js'
import { createLabTestsByProductIdLoader, createLabTestsByOrganizationIdLoader } from './labTestLoader.js'
import {
  createMediaByPodcastIdLoader,
  createMediaByEpisodeIdLoader,
  createMediaByClaimIdLoader,
  createMediaByPersonIdLoader,
  createMediaByOrganizationIdLoader,
  createMediaByProductIdLoader,
  createMediaByCompoundIdLoader,
  createMediaByLabTestIdLoader,
  createMediaByBiomarkerIdLoader,
  createMediaByCaseStudyIdLoader,
} from './mediaLoader.js'

export function createLoaders(prisma: PrismaClient) {
  return {
    personById: createPersonByIdLoader(prisma),
    organizationById: createOrganizationByIdLoader(prisma),
    productById: createProductByIdLoader(prisma),
    compoundById: createCompoundByIdLoader(prisma),
    biomarkerById: createBiomarkerByIdLoader(prisma),
    caseStudyById: createCaseStudyByIdLoader(prisma),

    claimsByEpisodeId: createClaimsByEpisodeIdLoader(prisma),
    guestsByEpisodeId: createGuestsByEpisodeIdLoader(prisma),
    sponsorsByEpisodeId: createSponsorsByEpisodeIdLoader(prisma),
    episodesByPodcastId: createEpisodesByPodcastIdLoader(prisma),

    productsByOrganizationId: createProductsByOrganizationIdLoader(prisma),
    labTestsByProductId: createLabTestsByProductIdLoader(prisma),
    labTestsByOrganizationId: createLabTestsByOrganizationIdLoader(prisma),

    mediaByPodcastId: createMediaByPodcastIdLoader(prisma),
    mediaByEpisodeId: createMediaByEpisodeIdLoader(prisma),
    mediaByClaimId: createMediaByClaimIdLoader(prisma),
    mediaByPersonId: createMediaByPersonIdLoader(prisma),
    mediaByOrganizationId: createMediaByOrganizationIdLoader(prisma),
    mediaByProductId: createMediaByProductIdLoader(prisma),
    mediaByCompoundId: createMediaByCompoundIdLoader(prisma),
    mediaByLabTestId: createMediaByLabTestIdLoader(prisma),
    mediaByBiomarkerId: createMediaByBiomarkerIdLoader(prisma),
    mediaByCaseStudyId: createMediaByCaseStudyIdLoader(prisma),
  }
}

export type Loaders = ReturnType<typeof createLoaders>
