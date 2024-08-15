import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { Navigation } from "@/components/navigation";
import Proposal from "@/components/proposal";
import { redirect } from "next/navigation";
import { Proposal as ProposalType } from "@/lib/types";

import {
  ChevronsLeftRightIcon as MetadataIcon,
  UsersIcon as AuthorsIcon,
  ListChecksIcon as RequiresIcon,
  LinkIcon
} from "lucide-react";

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
          <div className="pb-20">
            <div className="md:max-w-4xl lg:max-w-5xl mx-auto">
              <h1 className="text-5xl font-bold mb-2 mt-12 break-words text-[#3f3f3f] dark:text-[#e7e7e7]">
                {proposal.proposal_type}-{proposal.number}: {proposal.title}
              </h1>
              <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">{proposal.description}</h3>
              {proposal.title_descriptive || proposal.why_important ? (
                <div className="bg-yellow-50 dark:bg-blue-900 p-4 rounded-lg shadow-sm mb-6 border-orange-300 dark:border-transparent border">
                  <div className="w-fit bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 mb-2 rounded dark:bg-blue-200 dark:text-blue-800">
                    In simple terms
                  </div>
                  {proposal.title_descriptive && (
                    <>
                      <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                        What does {proposal.proposal_type}-{proposal.number} do?
                      </h4>
                      <p className="mb-4 text-gray-700 dark:text-gray-300">{proposal.title_descriptive}</p>
                    </>
                  )}
                  {proposal.why_important && (
                    <>
                      <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                        Why is it important?
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">{proposal.why_important}</p>
                    </>
                  )}
                </div>
              ) : (
                <hr className="border-t border-gray-200 dark:border-gray-700 my-2" />
              )}
              <metadata className="flex flex-col gap-[3px]">
                <div className="relative flex items-start p-0 overflow-hidden">
                  <div className="flex self-stretch items-start flex-row flex-shrink-0 w-36 min-w-36 group text-sm py-1 text-muted-foreground font-medium">
                    <div>
                      <MetadataIcon className="shrink-0 w-[18px] h-[18px] mr-2 text-muted-foreground" />
                    </div>
                    Metadata
                  </div>
                  <div className="flex flex-1 gap-1 items-start self-stretch min-h-8 overflow-hidden text-sm py-1">
                    {proposal.status} / {proposal.type}: {proposal.category} / {proposal.created_at}
                  </div>
                </div>
                <div className="relative flex items-start p-0 overflow-hidden">
                  <div className="flex self-stretch items-start flex-row flex-shrink-0 w-36 min-w-36 group text-sm py-1 text-muted-foreground font-medium">
                    <div>
                      <AuthorsIcon className="shrink-0 w-[18px] h-[18px] mr-2 text-muted-foreground" />
                    </div>
                    Authors
                  </div>
                  <div className="flex flex-1 gap-1 items-start self-stretch min-h-8 overflow-hidden text-sm py-1">
                    {proposal.authors}
                  </div>
                </div>
                <div className="relative flex items-start p-0 overflow-hidden">
                  <div className="flex self-stretch items-start flex-row flex-shrink-0 w-36 min-w-36 group text-sm py-1 text-muted-foreground font-medium">
                    <div>
                      <RequiresIcon className="shrink-0 w-[18px] h-[18px] mr-2 text-muted-foreground" />
                    </div>
                    Requires
                  </div>
                  <div className="flex flex-1 gap-1 items-start self-stretch min-h-8 overflow-hidden text-sm py-1">
                    {proposal.requires}
                  </div>
                </div>
                <div className="relative flex items-start p-0 overflow-hidden">
                  <div className="flex self-stretch items-start flex-row flex-shrink-0 w-36 min-w-36 group text-sm py-1 text-muted-foreground font-medium">
                    <div>
                      <LinkIcon className="shrink-0 w-[18px] h-[18px] mr-2 text-muted-foreground" />
                    </div>
                    Links
                  </div>
                  <div className="flex flex-1 gap-1 items-start self-stretch min-h-8 overflow-hidden text-sm py-1">
                    {proposal.official_url} {proposal.github_url} {proposal.discussion_url} {proposal.links}
                  </div>
                </div>
              </metadata>
              <Proposal proposal={proposal} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
// // w-6 h-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition
