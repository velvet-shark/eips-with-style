"use client";

import { useProposals } from "@/contexts/ProposalContext";
import { Navigation } from "@/components/navigation";

export default function ClientNavigation() {
  const { allProposals } = useProposals();
  return <Navigation proposals={allProposals} />;
}
