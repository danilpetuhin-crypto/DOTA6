import { PrismaClient } from '../generated/prisma/index.js';

const globalForPrisma = globalThis;

// Vercel Prisma Database использует POSTGRES_URL для serverless функций
const databaseUrl = process.env.POSTGRES_URL || 
                    process.env.DATABASE_URL || 
                    process.env.PRISMA_DATABASE_URL;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasourceUrl: databaseUrl
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
