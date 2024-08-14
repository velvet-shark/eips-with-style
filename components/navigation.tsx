"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { ProposalList } from "@/components/proposal-list";
import { SearchLink } from "@/components/search-link";
import { Logo } from "@/components/logo";
import { ChevronsLeft, ChevronsRight, MenuIcon } from "lucide-react";
import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { ElementRef, useRef, useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";

import { cn } from "@/lib/utils";

interface NavigationProps {
  proposals: any[]; // Adjust the type according to your data structure
}

export const Navigation: React.FC<NavigationProps> = ({ proposals }) => {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const params = useParams();

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

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

      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.setProperty("width", isMobile ? "0" : "calc(100% - 240px)");
      navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");
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

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[99999]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        <div>
          <div className="block flex-shrink-0 flex-grow-0">
            {/* Collapse button */}
            <div
              onClick={collapse}
              role="button"
              className={cn(
                `w-6 h-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition`,
                isMobile && "opacity-100"
              )}
            >
              <ChevronsLeft className="h-6 w-6" />
            </div>
            <div>
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
              <SearchLink />
            </div>
          </div>
          {/* Container for the proposal list */}
          <div className="mt-4">
            <ProposalList proposals={proposals} />
          </div>
          {/* Resizer handle for adjusting sidebar width */}
          <div
            onMouseDown={handleMouseDown}
            onClick={resetWidth}
            className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
          />
          {/* Container for the mode toggle button, positioned at the bottom, sticky */}
          <div className="absolute sticky bottom-0 left-0 right-0 p-4 bg-secondary flex justify-center">
            <ModeToggle />
          </div>
        </div>
      </aside>

      <div
        className={cn(
          `absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]`,
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full"
        )}
        ref={navbarRef}
      >
        <nav className="bg-transparent px-3 py-2 w-full">
          {isCollapsed && (
            <div className="relative group">
              <MenuIcon
                onClick={resetWidth}
                role="button"
                className="h-6 w-6 text-muted-foreground group-hover:opacity-0 transition-opacity"
              />
              <ChevronsRight
                onClick={resetWidth}
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
