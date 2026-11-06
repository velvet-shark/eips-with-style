import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex-server";

// Static, CDN-cached list used by search and the sidebar. Replaces a per-visitor Convex websocket query.
export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const proposals = await getConvexClient().query(api.proposals.listAllProposals, {});
  return NextResponse.json({ data: proposals });
}
