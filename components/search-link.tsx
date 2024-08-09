"use client";

import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

export function SearchLink() {
  return (
    <div
      className="group min-h-[30px] text-sm py-1.5 px-2 mx-2 rounded-md hover:bg-primary/10 flex items-center font-medium bg-primary/5 text-primary"
      // onClick={onClick}
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
