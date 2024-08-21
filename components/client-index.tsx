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
                    <strong>ERCs</strong> - Ethereum Requests for Comments
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
                there's a <span className="font-semibold text-green-600 dark:text-green-400">Why is it important?</span>{" "}
                section that explains why the proposal matters and why it is included in this list.
              </p>

              <p>
                Happy building and proposing! <span className="text-red-500">❤️</span>
              </p>
            </div>

            <footer className="mt-[5rem] text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex flex-col items-start justify-center gap-2 mt-2">
                <div className="flex items-start mb-2">
                  <svg
                    viewBox="0 0 98 96"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 w-4 h-4 flex-shrink-0 mt-[4px]"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
                      className="fill-gray-600 dark:fill-gray-400"
                    />
                  </svg>
                  <span className="text-left">
                    You can find the code for this project on GitHub at{" "}
                    <a
                      href="https://github.com/velvet-shark/eips-with-style"
                      className="text-blue-500 hover:underline"
                      target="_blank"
                    >
                      https://github.com/velvet-shark/eips-with-style
                    </a>
                    . Feel free to submit pull requests or open issues there.
                  </span>
                </div>
                <div className="flex items-start">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-[4px]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  <span className="text-left">
                    Follow me on Twitter{" "}
                    <a
                      href="https://twitter.com/velvet_shark"
                      className="text-blue-500 hover:underline"
                      target="_blank"
                    >
                      @velvet_shark
                    </a>{" "}
                    for more web3 and blockchain content!
                  </span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
