import Proposal from "@/components/proposal";
import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { Proposal as ProposalType } from "@/lib/types";
import RootLayout from "@/app/layout";

export default async function ProposalPage({ params }: { params: { slug: string } }) {
  const supabase = createBrowserClient();
  const slug = params.slug;

  const { data: proposal } = await supabase.from("proposals").select("*").eq("slug", slug).single();

  if (!proposal) {
    redirect("/error");
  }

  return (
    <RootLayout>
      <div className="w-full min-h-dvh p-3">
        <h1 className="text-4xl font-bold mb-4">
          {proposal.proposal_type}-{proposal.number}: {proposal.title}
        </h1>
        <br />
        <Proposal proposal={proposal} />
      </div>
    </RootLayout>
  );
}
