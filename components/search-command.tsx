"use client";

import { File } from "lucide-react";
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
import { useEffect, useState } from "react";
import { ProposalShort } from "@/lib/types";
import { createClient as createBrowserClient } from "@/utils/supabase/client";

export function SearchCommand() {
  const router = useRouter();
  const [proposals, setProposals] = useState<ProposalShort[]>([]);

  useEffect(() => {
    const fetchProposals = async () => {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from("proposals").select("*");
      if (error) {
        console.error("Error fetching proposals:", error);
      } else {
        setProposals(data || []);
      }
    };

    fetchProposals();
  }, []);
  const [isMounted, setIsMounted] = useState(false);

  const toggle = useSearch((store) => store.toggle);
  const isOpen = useSearch((store) => store.isOpen);
  const onClose = useSearch((store) => store.onClose);

  useEffect(() => {
    setIsMounted(true);
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

  const onSelect = (proposal_type: string, slug: string) => {
    const proposalType = proposal_type.toLowerCase();
    const proposalSlug = slug.toLowerCase();
    router.push(`/${proposalType}s/${proposalSlug}`);
    onClose();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder={"Search EIP, ERC, CAIP, or RIP"} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Proposals">
          {proposals?.map((proposal) => (
            <CommandItem
              key={proposal.id}
              value={`${proposal.id}`}
              title={proposal.title}
              onSelect={() => onSelect(proposal.proposal_type, proposal.slug)}
            >
              <File className="w-4 h-4 mr-2" />
              <span>
                {proposal.proposal_type}-{proposal.number} {proposal.title}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
