import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

export async function trackProposalView(proposalId: string) {
  try {
    if (!convex) {
      console.error("NEXT_PUBLIC_CONVEX_URL is missing; cannot track proposal views.");
      return;
    }
    const userAgent = navigator.userAgent;

    await convex.mutation(api.views.trackView, {
      proposalId: proposalId as Id<"proposals">,
      userAgent
    });
  } catch (error) {
    console.error("Error tracking view:", error);
  }
}

export async function getPopularProposals(daysBack: number = 30, limit: number = 20) {
  try {
    const params = new URLSearchParams({
      days: String(daysBack),
      limit: String(limit)
    });
    const response = await fetch(`/api/popular?${params.toString()}`);
    if (!response.ok) {
      console.error("Error fetching popular proposals:", response.status);
      return [];
    }

    const payload = (await response.json()) as { data?: any[] };
    return payload.data || [];
  } catch (error) {
    console.error("Error fetching popular proposals:", error);
    return [];
  }
}
