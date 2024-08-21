"use client";

import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useSearch } from "@/hooks/use-search";

interface SearchLinkProps {
  className?: string;
}

export function SearchLink({ className = "" }: SearchLinkProps) {
  const search = useSearch();

  return (
    <div
      className={`group min-h-[30px] text-sm py-1.5 pl-1 pr-2 rounded-md hover:bg-primary/10 flex items-center font-medium bg-primary/5 text-primary ${className}`}
      onClick={search.onOpen}
      role="button"
    >
      <MagnifyingGlassIcon className="shrink-0 w-[18px] h-[18px] mr-2 text-muted-foreground" />
      <span className="truncate">Search</span>
      <kbd
        className="ml-auto pointer-events-none inline-flex gap-1 items-center h-5 select-none rounded border
      bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
      >
        <span className="text-xs">⌘</span>K
      </kbd>
    </div>
  );
}
