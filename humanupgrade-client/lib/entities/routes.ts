/**
 * Single source of truth for entity route URLs.
 *
 * Always use these helpers when linking to public entity pages — never
 * hand-build the URL — so renames propagate cleanly.
 */

import type { GlobalSearchEntityType } from '@/lib/gql'

export type EntityKind = Lowercase<GlobalSearchEntityType> extends infer T
  ? T extends `${infer A}_${infer B}`
    ? `${A}${Capitalize<B>}`
    : T
  : never

export const entityRoutes = {
  podcast:      (slug: string) => `/e/podcasts/${slug}` as const,
  episode:      (slug: string) => `/e/episodes/${slug}` as const,
  claim:        (id: string)   => `/e/claims/${id}` as const,
  person:       (slug: string) => `/e/people/${slug}` as const,
  organization: (slug: string) => `/e/organizations/${slug}` as const,
  product:      (slug: string) => `/e/products/${slug}` as const,
  compound:     (slug: string) => `/e/compounds/${slug}` as const,
  labTest:      (slug: string) => `/e/lab-tests/${slug}` as const,
  biomarker:    (slug: string) => `/e/biomarkers/${slug}` as const,
  caseStudy:    (slug: string) => `/e/case-studies/${slug}` as const,
} as const

export const entityLabel = {
  podcast: 'Podcast',
  episode: 'Episode',
  claim: 'Claim',
  person: 'Person',
  organization: 'Organization',
  product: 'Product',
  compound: 'Compound',
  labTest: 'Lab test',
  biomarker: 'Biomarker',
  caseStudy: 'Case study',
} as const
