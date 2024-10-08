"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ProposalShort } from "@/lib/types";

import {
  FileInputIcon as EIPIcon,
  FileCheck2Icon as ERCIcon,
  FileStackIcon as CAIPIcon,
  ScrollIcon as RIPIcon
} from "lucide-react";

interface ProposalListProps {
  proposals: ProposalShort[];
}

export const ProposalList: React.FC<ProposalListProps> = ({ proposals }) => {
  if (!proposals || proposals.length === 0) {
    return <p className="text-sm text-muted-foreground p-3">No featured proposals at the moment.</p>;
  }

  return (
    <div>
      {proposals.map((proposal) => (
        <div
          key={proposal.id}
          className="group min-h-[27px] text-sm py-1 px-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium"
        >
          <Link
            href={`/${proposal.proposal_type.toLowerCase()}s/${proposal.slug.toLowerCase()}`}
            className="flex items-center w-full"
          >
            <div>
              {proposal.proposal_type === "EIP" && (
                <EIPIcon className="shrink-0 w-[18px] h-[18px] mr-2 text-muted-foreground" />
              )}
              {proposal.proposal_type === "ERC" && (
                <ERCIcon className="shrink-0 w-[18px] h-[18px] mr-2 text-muted-foreground" />
              )}
              {proposal.proposal_type === "CAIP" && (
                <CAIPIcon className="shrink-0 w-[18px] h-[18px] mr-2 text-muted-foreground" />
              )}
              {proposal.proposal_type === "RIP" && (
                <RIPIcon className="shrink-0 w-[18px] h-[18px] mr-2 text-muted-foreground" />
              )}
            </div>
            <span className="truncate">
              <span className="font-semibold">
                {proposal.proposal_type}-{proposal.number}
              </span>{" "}
              {proposal.title}
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
};
