import type { PrismaConfig } from '@prisma/config';

export default {
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts"
  }
} satisfies PrismaConfig;
