import { GraphQLScalarType, Kind } from 'graphql'
import { queryResolvers } from './query.js'
import { mutationResolvers } from './mutation.js'
import { podcastResolvers } from './podcast.js'
import { episodeResolvers } from './episode.js'
import { claimResolvers } from './claim.js'
import { personResolvers } from './person.js'
import { organizationResolvers } from './organization.js'
import { productResolvers } from './product.js'
import { compoundResolvers } from './compound.js'
import { labTestResolvers } from './labTest.js'
import { biomarkerResolvers } from './biomarker.js'
import { caseStudyResolvers } from './caseStudy.js'

const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO-8601 date-time string',
  serialize(value: unknown) {
    if (value instanceof Date) return value.toISOString()
    if (typeof value === 'string') return value
    throw new Error('DateTime cannot represent non-date value')
  },
  parseValue(value: unknown) {
    if (typeof value === 'string') return new Date(value)
    throw new Error('DateTime must be a string')
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return new Date(ast.value)
    return null
  },
})

const DecimalScalar = new GraphQLScalarType({
  name: 'Decimal',
  description: 'Decimal number transmitted as string for precision',
  serialize(value: unknown) {
    return Number(value)
  },
  parseValue(value: unknown) {
    return Number(value)
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.FLOAT || ast.kind === Kind.INT) return Number(ast.value)
    if (ast.kind === Kind.STRING) return Number(ast.value)
    return null
  },
})

const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'Arbitrary JSON value',
  serialize(value: unknown) {
    return value
  },
  parseValue(value: unknown) {
    return value
  },
  parseLiteral(ast: any) {
    if (ast.kind === Kind.STRING) {
      try { return JSON.parse(ast.value) } catch { return ast.value }
    }
    return null
  },
})

export const resolvers = {
  DateTime: DateTimeScalar,
  Decimal: DecimalScalar,
  JSON: JSONScalar,
  ...queryResolvers,
  ...mutationResolvers,
  ...podcastResolvers,
  ...episodeResolvers,
  ...claimResolvers,
  ...personResolvers,
  ...organizationResolvers,
  ...productResolvers,
  ...compoundResolvers,
  ...labTestResolvers,
  ...biomarkerResolvers,
  ...caseStudyResolvers,
}
