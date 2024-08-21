import { Metadata, ResolvingMetadata } from "next";
import { createClient } from "@/utils/supabase/server";
import ClientNavigation from "@/components/client-navigation";
import Proposal from "@/components/proposal";
import MetadataItem from "@/components/metadata-item";
import Authors from "@/components/authors";
import RequiresLinks from "@/components/requires-links";
import LinkItem from "@/components/link-item";
import MetadataGeneralInfo from "@/components/metadata-general-info";
import { Proposal as ProposalType } from "@/lib/types";
import { replaceImageUrls } from "@/lib/utils";
import { redirect } from "next/navigation";

import {
  ChevronsLeftRightIcon as MetadataIcon,
  UsersIcon as AuthorsIcon,
  ListChecksIcon as RequiresIcon,
  LinkIcon
} from "lucide-react";

type Props = {
  params: { proposalType: string; slug: string };
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { proposalType, slug } = params;
  const supabase = createClient();

  const { data: proposal } = await supabase
    .from("proposals")
    .select("*")
    .eq("slug", slug)
    .eq("proposal_type", proposalType.toUpperCase().slice(0, -1))
    .single();

  if (!proposal) {
    return {
      title: "Proposal Not Found"
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const ogImageUrl = new URL("/api/og", baseUrl);
  ogImageUrl.searchParams.append("proposal", `${proposal.proposal_type}-${proposal.number}`);
  ogImageUrl.searchParams.append("title", proposal.title);

  return {
    title: `${proposal.proposal_type}-${proposal.number}: ${proposal.title} | EIP.directory`,
    description: proposal.description,
    openGraph: {
      title: `${proposal.proposal_type}-${proposal.number}: ${proposal.title} | EIP.directory`,
      description: proposal.description,
      url: `https://eip.directory/${proposalType}/${slug}`,
      siteName: "EIP.directory",
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630
        }
      ],
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${proposal.proposal_type}-${proposal.number}: ${proposal.title} | EIP.directory`,
      description: proposal.description,
      creator: "@velvet_shark",
      images: [ogImageUrl.toString()]
    }
  };
}

export default async function ProposalPage({ params }: Props) {
  const { proposalType, slug } = params;
  const supabase = createClient();

  async function checkProposal(type: string, proposalSlug: string) {
    const { data } = await supabase
      .from("proposals")
      .select("*")
      .eq("slug", proposalSlug)
      .eq("proposal_type", type.toUpperCase().slice(0, -1))
      .single();
    return data;
  }

  let proposal = await checkProposal(proposalType, slug);

  // If it's an EIP and not found, check if it exists as an ERC
  if (!proposal && proposalType === "eips") {
    const ercSlug = slug.replace("eip-", "erc-");
    const ercProposal = await checkProposal("ercs", ercSlug);
    if (ercProposal) {
      redirect(`/ercs/${ercSlug}`);
    }
  }

  // If still not found, redirect to 404
  if (!proposal) {
    redirect("/404");
  }

  if (proposal) {
    proposal.content = replaceImageUrls(proposal.content, proposal.proposal_type);
  }

  return (
    <div className="flex h-full dark:bg-[#1f1f1f]">
      <ClientNavigation />
      <main className="flex-1 h-full overflow-y-auto">
        <div className="flex-1 px-6 pb-10 items-center justify-center md:justify-start gap-y-8">
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
              <div className="flex flex-col gap-[3px]">
                <MetadataItem icon={MetadataIcon} label="Metadata" proposal={proposal}>
                  <MetadataGeneralInfo
                    status={proposal.status}
                    type={proposal.type}
                    category={proposal.category}
                    createdAt={proposal.created_at}
                  />
                </MetadataItem>
                <MetadataItem icon={AuthorsIcon} label="Authors" proposal={proposal}>
                  <Authors authors={proposal.authors} />
                </MetadataItem>
                {proposal.requires && (
                  <MetadataItem icon={RequiresIcon} label="Requires" proposal={proposal}>
                    <RequiresLinks
                      requires={
                        Array.isArray(proposal.requires)
                          ? proposal.requires
                          : proposal.requires.split(",").map((num: string) => num.trim())
                      }
                    />
                  </MetadataItem>
                )}
                <MetadataItem icon={LinkIcon} label="Links" proposal={proposal}>
                  <LinkItem
                    official_url={proposal.official_url}
                    github_url={proposal.github_url}
                    discussion_url={proposal.discussion_url}
                    links={proposal.links}
                  />
                </MetadataItem>
              </div>
              <Proposal proposal={proposal} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
