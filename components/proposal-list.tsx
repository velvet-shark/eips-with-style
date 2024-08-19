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
  return (
    <>
      {proposals && proposals.length > 0 ? (
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
                  <EIPIcon className="shrink-0 w-[18px] h-[18px] mr-2 text-muted-foreground" />
                </div>
                <span className="truncate">
                  {proposal.proposal_type}-{proposal.number} {proposal.title}
                </span>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>No proposals found.</p>
      )}
    </>
  );
};
