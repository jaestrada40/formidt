import { PrismaClient } from '@prisma/client';

// Single shared Prisma client instance.
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['error', 'warn', 'query'],
});

/**
 * Ensures the Postgres sequence used to generate human-friendly, guaranteed-unique
 * application IDs exists. Safe to call on every boot (idempotent).
 */
export async function ensureApplicationSequence(): Promise<void> {
  await prisma.$executeRawUnsafe(
    `CREATE SEQUENCE IF NOT EXISTS application_seq START WITH 1 INCREMENT BY 1;`
  );
}
