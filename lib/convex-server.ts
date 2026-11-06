import "server-only";
import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL;

// Unlike `fetchQuery` from convex/nextjs, this client does not force `cache: "no-store"`,
// so pages that read from Convex can still be statically rendered and revalidated (ISR).
export function getConvexClient() {
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is required.");
  }
  return new ConvexHttpClient(convexUrl);
}
