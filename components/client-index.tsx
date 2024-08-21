"use client";

import { Navigation } from "@/components/navigation";
import { useProposals } from "@/contexts/ProposalContext";
import { Logo } from "@/components/logo";
import { SearchLink } from "@/components/search-link";

export default function ClientIndex() {
  const { allProposals } = useProposals();

  return (
    <div className="h-full flex dark:bg-[#1F1F1F]">
      <Navigation proposals={allProposals} />
      <main className="flex-1 h-full overflow-y-auto">
        <div className="flex-1 px-6 pb-10 items-center justify-center md:justify-start text-center gap-y-8">
          <div className="max-w-4xl mx-auto mt-16">
            <div className="flex items-center justify-center mb-6">
              <Logo width={60} height={60} className="w-10 h-10 md:w-[60px] md:h-[60px] mr-2" />
              <h1 className="ml-1 text-[2.5rem] lg:text-[4rem] font-bold">EIP Directory</h1>
            </div>

            {/* Search form */}
            <div className="mb-8 max-w-xl mx-auto">
              <SearchLink className="w-full text-left py-3 text-lg" />
            </div>

            <div className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl text-left space-y-6">
              <p className="font-semibold">Welcome to theEthereum Improvement Proposal (EIP) Directory.</p>

              <div>
                <p className="mb-2">You can find all Ethereum proposals here:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>
                    <strong>EIPs</strong> - Ethereum Improvement Proposals
                  </li>
                  <li>
                    <strong>ERCs</strong> - Ethereum Request for Comment
                  </li>
                  <li>
                    <strong>CAIPs</strong> - Chain Agnostic Improvement Proposals
                  </li>
                  <li>
                    <strong>RIPs</strong> - Rollup Improvement Proposals
                  </li>
                </ul>
              </div>

              <p>
                There are hundreds of proposals between these categories. The goal of EIP.directory is to give you
                access to all of them but also, and maybe more importantly, to give you a sense of what is important and
                noteworthy.
              </p>

              <p>
                For proposals that are important, noteworthy, or interesting (you can find these in the sidebar),
                there's a <span className="font-bold text-green-600 dark:text-green-400">Why is it important?</span>{" "}
                section that explains why the proposal matters and why it is included in this list.
              </p>

              <p>
                Happy building and proposing! <span className="text-red-500">❤️</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
