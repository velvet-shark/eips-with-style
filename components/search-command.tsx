"use client";

import {
  FileInputIcon as EIPIcon,
  FileCheck2Icon as ERCIcon,
  FileStackIcon as CAIPIcon,
  ScrollIcon as RIPIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { useSearch } from "@/hooks/use-search";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { ProposalShort } from "@/lib/types";
import { useProposals } from "@/contexts/ProposalContext";

// Simple debounce function
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export function SearchCommand() {
  const router = useRouter();
  const { featuredProposals, allProposals } = useProposals();
  const [searchTerm, setSearchTerm] = useState("");
  const isSearching = searchTerm.length > 0;
  const commandListRef = useRef<HTMLDivElement>(null);

  const toggle = useSearch((store) => store.toggle);
  const isOpen = useSearch((store) => store.isOpen);
  const onClose = useSearch((store) => store.onClose);

  const resetSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  useEffect(() => {
    if (isOpen) {
      resetSearch();
    }
  }, [isOpen, resetSearch]);

  const debouncedSetSearchTerm = useMemo(() => debounce((value: string) => setSearchTerm(value), 300), []);

  const handleSearch = useCallback(
    (value: string) => {
      debouncedSetSearchTerm(value.toLowerCase().trim());
      if (commandListRef.current) {
        commandListRef.current.scrollTo(0, 0);
      }
    },
    [debouncedSetSearchTerm]
  );

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const normalizedTerm = searchTerm.replace(/\s+/g, "").replace(/-/g, "");

    const scoreProposal = (proposal: ProposalShort) => {
      const number = proposal.number.toString();
      const slug = proposal.slug.toLowerCase();
      const title = proposal.title.toLowerCase();
      const type = proposal.proposal_type.toLowerCase();

      // Precomputed strings for quick comparisons
      const typeNumberDash = `${type}-${number}`;
      const typeNumber = `${type}${number}`;
      const slugNoDash = slug.replace(/-/g, "");

      let score = 0;

      // Exact intent matches get the highest weight
      if (slug === searchTerm) score += 120;
      if (slugNoDash === normalizedTerm) score += 110;
      if (typeNumberDash === searchTerm) score += 115;
      if (typeNumber === normalizedTerm) score += 105;
      if (number === searchTerm) score += 90;

      // Prefix matches feel more intentional than generic substring hits
      if (slug.startsWith(searchTerm) || title.startsWith(searchTerm) || typeNumberDash.startsWith(searchTerm)) {
        score += 60;
      }

      // General substring matches keep broader discoverability
      if (
        number.includes(searchTerm) ||
        slug.includes(searchTerm) ||
        title.includes(searchTerm) ||
        type.includes(searchTerm)
      ) {
        score += 30;
      }

      return score;
    };

    return allProposals
      .map((proposal) => ({ proposal, score: scoreProposal(proposal) }))
      .filter(({ score }) => score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          new Date(b.proposal.created_at).getTime() - new Date(a.proposal.created_at).getTime()
      )
      .map(({ proposal }) => proposal);
  }, [allProposals, searchTerm, isSearching]);

  const onSelect = useCallback(
    (proposal_type: string, slug: string) => {
      const proposalType = proposal_type.toLowerCase();
      const proposalSlug = slug.toLowerCase();
      router.push(`/${proposalType}s/${proposalSlug}`);
      onClose();
    },
    [router, onClose]
  );

  const renderProposalItem = useCallback(
    (proposal: ProposalShort) => (
      <CommandItem
        key={proposal.id}
        value={`${proposal.proposal_type}-${proposal.number} ${proposal.title} ${proposal.slug}`}
        onSelect={() => onSelect(proposal.proposal_type, proposal.slug)}
      >
        {proposal.proposal_type === "EIP" && <EIPIcon className="w-4 h-4 mr-2 text-muted-foreground" />}
        {proposal.proposal_type === "ERC" && <ERCIcon className="w-4 h-4 mr-2 text-muted-foreground" />}
        {proposal.proposal_type === "CAIP" && <CAIPIcon className="w-4 h-4 mr-2 text-muted-foreground" />}
        {proposal.proposal_type === "RIP" && <RIPIcon className="w-4 h-4 mr-2 text-muted-foreground" />}
        <span>
          {proposal.proposal_type}-{proposal.number} {proposal.title}
        </span>
      </CommandItem>
    ),
    [onSelect]
  );

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose} shouldFilter={false}>
      <CommandInput placeholder="Search EIP, ERC, CAIP, or RIP" onValueChange={handleSearch} />
      <CommandList ref={commandListRef}>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading={isSearching ? "Search Results" : "Featured Proposals"}>
          {isSearching ? searchResults.map(renderProposalItem) : featuredProposals.map(renderProposalItem)}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
