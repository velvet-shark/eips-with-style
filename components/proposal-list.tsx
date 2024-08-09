"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { FileIcon } from "lucide-react";

interface Proposal {
  id: number;
  proposal_type: string;
  number: number;
  title: string;
  description: string;
}

interface ProposalListProps {
  proposals: Proposal[];
}

export const ProposalList: React.FC<ProposalListProps> = ({ proposals }) => {
  return (
    <>
      {proposals && proposals.length > 0 ? (
        <div>
          {proposals.map((proposal) => (
            <div key={proposal.id} className="font-semibold text-sm">
              {proposal.proposal_type}-{proposal.number}
            </div>
          ))}
        </div>
      ) : (
        <p>No proposals found.</p>
      )}
    </>
  );
};
