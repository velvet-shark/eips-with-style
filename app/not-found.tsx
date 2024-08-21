"use client";

import { Navigation } from "@/components/navigation";
import { useProposals } from "@/contexts/ProposalContext";
import { Logo } from "@/components/logo";
import { SearchLink } from "@/components/search-link";
import Link from "next/link";

export default function NotFound() {
  const { allProposals } = useProposals();

  return (
    <div className="h-full flex dark:bg-[#1F1F1F]">
      <Navigation proposals={allProposals} />
      <main className="flex-1 h-full overflow-y-auto">
        <div className="flex-1 px-6 pb-10 items-center justify-center md:justify-start text-center gap-y-8">
          <div className="max-w-4xl mx-auto mt-16">
            <div className="flex items-center justify-center mb-6">
              <Logo width={40} height={40} className="w-5 h-5 md:w-[40px] md:h-[40px] mr-1" />
              <h1 className="ml-1 text-[1.25rem] lg:text-[2rem] font-bold">EIP Directory</h1>
            </div>
            <h2 className="text-4xl font-bold mb-4 flex items-center justify-center text-red-500 dark:text-red-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Page Not Found
            </h2>
            <p className="text-xl mb-8">🤔 Hmmm, couldn't find what you were looking for 🤷‍♂️</p>
            {/* Search form */}
            <div className="mb-8 max-w-xl mx-auto">
              <p className="text-lg mb-2">Maybe try searching for it?</p>
              <SearchLink className="w-full text-left py-3 text-lg" />
            </div>
            ... or just{" "}
            <Link href="/" className="text-blue-500 hover:underline">
              return to homepage
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
