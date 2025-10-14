import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
  prisma: any
}

const createPrismaClient = () => {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
  
  return new PrismaClient({ adapter }).$extends(withAccelerate())
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
