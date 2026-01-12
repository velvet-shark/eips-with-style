import { createClient } from "@/utils/supabase/client";

export async function trackProposalView(proposalId: string) {
  const supabase = createClient();

  try {
    // Get user's IP (in a real app, you'd get this from headers)
    const userAgent = navigator.userAgent;

    const { error } = await supabase.from("view_logs").insert({
      proposal_id: proposalId,
      user_agent: userAgent,
      viewed_at: new Date().toISOString()
    });

    if (error) {
      console.error("Error tracking view:", error);
    }
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
