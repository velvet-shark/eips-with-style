"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { ProposalList } from "@/components/proposal-list";
import { SearchLink } from "@/components/search-link";
import { Logo } from "@/components/logo";
import { ChevronsLeft, ChevronsRight, MenuIcon } from "lucide-react";
import { TwitterLogoIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { ElementRef, useRef, useEffect, useState, useCallback } from "react";
import { useMediaQuery } from "usehooks-ts";
import { useProposals } from "@/contexts/ProposalContext";

import { cn } from "@/lib/utils";

export interface NavigationProps {
  proposals: any[]; // Replace 'any' with a more specific type if possible
}

export const Navigation: React.FC<NavigationProps> = ({ proposals }) => {
  const { featuredProposals } = useProposals();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const params = useParams();

  const [isScrolled, setIsScrolled] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        setIsScrolled(contentRef.current.scrollTop > 0);
      }
    };

    const currentContentRef = contentRef.current;
    if (currentContentRef) {
      currentContentRef.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (currentContentRef) {
        currentContentRef.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [pathname, isMobile]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;

    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth}px)`);
    }
  };
  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "100%" : "280px";
      navbarRef.current.style.setProperty("width", isMobile ? "0" : "calc(100% - 280px)");
      navbarRef.current.style.setProperty("left", isMobile ? "100%" : "280px");
      setTimeout(() => {
        setIsResetting(false);
      }, 300);
    }
  };

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const handleClick = useCallback((action: () => void) => {
    return (event: React.MouseEvent | React.TouchEvent) => {
      event.preventDefault();
      action();
    };
  }, []);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-full bg-secondary overflow-y-auto relative flex w-70 flex-col z-[99999]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div
            className={cn(
              "sticky top-0 bg-secondary pb-2.5 z-10 transition-shadow duration-200",
              isScrolled && "shadow-md dark:shadow-sm dark:shadow-gray-700"
            )}
          >
            {/* Collapse button */}
            <div
              onClick={handleClick(collapse)}
              onTouchStart={handleClick(collapse)}
              role="button"
              className={cn(
                `w-6 h-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition`,
                isMobile && "opacity-100"
              )}
            >
              <ChevronsLeft className="h-6 w-6" />
            </div>
            {/* Logo and home link */}
            <Link href="/">
              <div className="flex items-center text-sm p-3 w-full hover:bg-primary/5" role="button">
                <div className="gap-x-2 flex items-center max-w-[150px]">
                  <div className="w-5 h-5">
                    <Logo />
                  </div>
                  <span className="text-start font-semibold line-clamp-1 pl-1">EIP.directory</span>
                </div>
              </div>
            </Link>
            {/* Search form */}
            <SearchLink className="mx-2" />
          </div>
          <div ref={contentRef} className="flex-grow overflow-y-auto">
            {/* Container for the featured proposals */}
            <div className="mt-3">
              <div className="group min-h-[27px] text-xs py-2 px-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground/70 font-sm font-semibold">
                Noteworthy & Featured
              </div>
              <ProposalList proposals={featuredProposals.map((p) => ({ ...p, featured: true }))} />
            </div>
          </div>
          {/* Sticky footer */}
          <div className="sticky bottom-0 left-0 right-0 p-4 flex justify-center space-x-4 bg-secondary">
            <Button variant="outline" size="icon" asChild>
              <Link href="https://twitter.com/velvet_shark" target="_blank" rel="noopener noreferrer">
                <TwitterLogoIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
              </Link>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link
                href="https://github.com/velvet-shark/eips-with-style.git"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubLogoIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all text-foreground/70 dark:text-foreground/90" />
              </Link>
            </Button>
            <ModeToggle />
          </div>
        </div>

        {/* Add resize handle */}
        <div
          onMouseDown={handleMouseDown}
          onClick={handleClick(resetWidth)}
          onTouchStart={handleClick(resetWidth)}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
        />
      </aside>

      <div
        className={cn(
          `absolute top-0 z-[99999] left-70 w-[calc(100%-280px)]`,
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full"
        )}
        ref={navbarRef}
      >
        <nav className="bg-transparent px-3 py-2 w-full">
          {isCollapsed && (
            <div className="relative group">
              <MenuIcon
                onClick={handleClick(resetWidth)}
                onTouchStart={handleClick(resetWidth)}
                role="button"
                className="h-6 w-6 text-muted-foreground group-hover:opacity-0 transition-opacity"
              />
              <ChevronsRight
                onClick={handleClick(resetWidth)}
                onTouchStart={handleClick(resetWidth)}
                role="button"
                className="h-6 w-6 text-muted-foreground absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          )}
        </nav>
      </div>
    </>
  );
};
