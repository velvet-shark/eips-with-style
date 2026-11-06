import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { isAdminEmail } from "./admin_email";

// Scripts (ingestion, enrichment) authenticate with a shared secret stored in the
// Convex deployment's INGEST_SECRET environment variable.
export function hasValidIngestSecret(secret: string | undefined) {
  const expected = process.env.INGEST_SECRET;
  if (!expected || !secret || secret.length !== expected.length) {
    return false;
  }
  let diff = 0;
  for (let index = 0; index < expected.length; index += 1) {
    diff |= expected.charCodeAt(index) ^ secret.charCodeAt(index);
  }
  return diff === 0;
}

export function requireIngestSecret(secret: string | undefined) {
  if (!hasValidIngestSecret(secret)) {
    throw new Error("Unauthorized");
  }
}

export async function isAdminUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  const user = await ctx.db.get(userId);
  const email = typeof user?.email === "string" ? user.email : null;
  return isAdminEmail(email);
}
