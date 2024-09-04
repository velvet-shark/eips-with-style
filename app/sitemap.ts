import { MetadataRoute } from "next";
import { createClient } from "@/utils/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  // Fetch all proposals
  const { data: proposals } = await supabase.from("proposals").select("proposal_type, slug, updated_at");

  const baseUrl = "https://eip.directory";

  const proposalUrls =
    proposals?.map((proposal) => ({
      url: `${baseUrl}/${proposal.proposal_type.toLowerCase()}s/${proposal.slug}`,
      lastModified: proposal.updated_at ? new Date(proposal.updated_at).toISOString() : new Date().toISOString()
    })) || [];

  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString()
    },
    ...proposalUrls
  ];
}
