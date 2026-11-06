import { Metadata, ResolvingMetadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Navigation } from "@/components/navigation";
import Proposal from "@/components/proposal";
import MetadataItem from "@/components/metadata-item";
import Authors from "@/components/authors";
import RequiresLinks from "@/components/requires-links";
import LinkItem from "@/components/link-item";
import MetadataGeneralInfo from "@/components/metadata-general-info";
import { replaceImageUrls } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { cache } from "react";
import ViewTracker from "@/components/view-tracker";
import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex-server";

import {
  ChevronsLeftRightIcon as MetadataIcon,
  UsersIcon as AuthorsIcon,
  ListChecksIcon as RequiresIcon,
  LinkIcon
} from "lucide-react";

type Props = {
  params: Promise<{ proposalType: string; slug: string }>;
};

const normalizeProposalType = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.toLowerCase().endsWith("s") ? trimmed.slice(0, -1).toUpperCase() : trimmed.toUpperCase();
};

// Pages are rendered on first visit, served from the CDN, and re-rendered in the background at most every
// 6 hours (ingestion runs daily). Admin enrichment edits revalidate the affected page immediately.
export const revalidate = 21600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

const getProposalBySlugType = cache(async (proposalType: string, slug: string) => {
  return getConvexClient().query(api.proposals.getProposalBySlugType, {
    slug,
    proposal_type: normalizeProposalType(proposalType)
  });
});

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { proposalType, slug } = await params;
  const proposal = await getProposalBySlugType(proposalType, slug);

  if (!proposal) {
    return {
      title: "Not Found",
      description: "The page you're looking for does not exist."
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  const ogImageUrl = `${siteConfig.url}/api/og?title=${encodeURIComponent(proposal.title)}&type=${encodeURIComponent(
    proposal.proposal_type
  )}&number=${encodeURIComponent(proposal.number)}`;

  return {
    title: `${proposal.proposal_type}-${proposal.number}: ${proposal.title}`,
    description: proposal.description || `${proposal.proposal_type}-${proposal.number}: ${proposal.title}`,
    openGraph: {
      title: `${proposal.proposal_type}-${proposal.number}: ${proposal.title}`,
      description: proposal.description || `${proposal.proposal_type}-${proposal.number}: ${proposal.title}`,
      url: `${siteConfig.url}/${proposalType}/${slug}`,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630
        },
        ...previousImages
      ],
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${proposal.proposal_type}-${proposal.number}: ${proposal.title}`,
      description: proposal.description || `${proposal.proposal_type}-${proposal.number}: ${proposal.title}`,
      images: [ogImageUrl]
    }
  };
}

export default async function ProposalPage({ params }: Props) {
  const { proposalType, slug } = await params;

  // Resolve redirects and 404s before rendering anything, so they get real HTTP status codes.
  if (slug.endsWith(".md")) {
    redirect(`/${proposalType}/${slug.slice(0, -3)}`);
  }

  const proposal = await getProposalBySlugType(proposalType, slug);

  if (!proposal) {
    // An EIP that moved to the ERC repository
    if (proposalType === "eips") {
      const ercSlug = slug.replace("eip-", "erc-");
      if (await getProposalBySlugType("ercs", ercSlug)) {
        redirect(`/ercs/${ercSlug}`);
      }
    }
    notFound();
  }

  proposal.content = replaceImageUrls(proposal.content, proposal.proposal_type);
  const requiresList = proposal.requires ?? [];

  return (
    <div className="flex h-full dark:bg-[#1f1f1f]">
      <ViewTracker proposalId={proposal.id} />
      <Navigation />
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
                {requiresList.length > 0 && (
                  <MetadataItem icon={RequiresIcon} label="Requires" proposal={proposal}>
                    <RequiresLinks requires={requiresList} />
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
