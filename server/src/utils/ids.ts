import { prisma } from '../db';

/**
 * Generates a guaranteed-unique, human-friendly application ID (e.g. APP-000042).
 *
 * Backed by a Postgres sequence (application_seq) rather than Math.random(), so
 * collisions are impossible even under concurrent submissions — the DB serializes
 * nextval() calls atomically. The result is additionally protected by a UNIQUE
 * constraint on Application.appId as a defense-in-depth backstop.
 */
export async function generateUniqueAppId(): Promise<string> {
  const rows = (await prisma.$queryRawUnsafe(`SELECT nextval('application_seq')`)) as {
    nextval: bigint;
  }[];
  const n = rows[0].nextval;
  return `APP-${n.toString().padStart(6, '0')}`;
}
