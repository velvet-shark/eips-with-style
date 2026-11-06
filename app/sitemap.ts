import { MetadataRoute } from "next";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex-server";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://eip.directory";
  const proposalUrls: MetadataRoute.Sitemap = [];
  const pageSize = 200;
  let cursor: string | null = null;
  let done = false;
  const client = getConvexClient();

  while (!done) {
    const page: FunctionReturnType<typeof api.proposals.listProposalsForSitemapPage> = await client.query(
      api.proposals.listProposalsForSitemapPage,
      {
        cursor,
        limit: pageSize
      }
    );

    page.page.forEach((proposal) => {
      proposalUrls.push({
        url: `${baseUrl}/${proposal.proposal_type.toLowerCase()}s/${proposal.slug}`,
        lastModified: proposal.updated_at ? new Date(proposal.updated_at).toISOString() : new Date().toISOString()
      });
    });

    done = page.isDone;
    cursor = page.continueCursor;
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString()
    },
    ...proposalUrls
  ];
}
