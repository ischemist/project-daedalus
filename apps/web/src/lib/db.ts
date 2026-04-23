import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "@/generated/prisma/client"

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5433/daedalus?schema=public"

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient
}

function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
    }),
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
