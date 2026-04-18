import type { ExpressContextFunctionArgument } from '@as-integrations/express5'
import type { PrismaClient } from '../../generated/client.js'
import { createLoaders, type Loaders } from '../loaders/index.js'
import { prisma } from './prisma.js'

export interface GraphQLContext {
  prisma: PrismaClient
  loaders: Loaders
}

export async function createContext(
  _args: ExpressContextFunctionArgument
): Promise<GraphQLContext> {
  const loaders = createLoaders(prisma)
  return { prisma, loaders }
}
