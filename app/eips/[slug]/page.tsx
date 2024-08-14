import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { Navigation } from "@/components/navigation";
import Proposal from "@/components/proposal";
import { redirect } from "next/navigation";
import { Proposal as ProposalType } from "@/lib/types";

export default async function ProposalPage({ params }: { params: { slug: string } }) {
  const supabase = createBrowserClient();
  const slug = params.slug;

  // Fetch proposals from Supabase
  const { data: proposals, error } = await supabase.from("proposals").select("*");
  if (error) {
    console.error("Error fetching proposals:", error);
  }
  // Return single proposal matching slug
  const { data: proposal } = await supabase.from("proposals").select("*").eq("slug", slug).single();

  if (!proposal) {
    redirect("/error");
  }

  return (
    <div className="flex h-full dark:bg-[#1f1f1f]">
      <Navigation proposals={proposals || []} />
      <main className="flex-1 h-full overflow-y-auto">
        <div className="flex-1 px-6 pb-10 items-center justify-center md:justify-start  gap-y-8">
          <div className="pb-40">
            <div className="md:max-w-4xl lg:max-w-5xl mx-auto">
              <h1 className="text-5xl font-bold mb-6 mt-12 break-words text-[#3f3f3f] dark:text-[#cfcfcf]">
                {proposal.proposal_type}-{proposal.number}: {proposal.title}
              </h1>
              <Proposal proposal={proposal} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
