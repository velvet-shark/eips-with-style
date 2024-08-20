"use client";

import { Navigation } from "@/components/navigation";
import { useProposals } from "@/contexts/ProposalContext";

export default function Index() {
  const { allProposals } = useProposals();

  return (
    <div className="h-full flex dark:bg-[#1F1F1F]">
      <Navigation proposals={allProposals} />
      <main className="flex-1 h-full overflow-y-auto">
        <div className="flex-1 px-6 pb-10 items-center justify-center md:justify-start text-center gap-y-8">
          <h1 className="text-4xl font-bold">Homepage</h1>
        </div>
      </main>
    </div>
  );
}
