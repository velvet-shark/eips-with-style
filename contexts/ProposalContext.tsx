"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ProposalShort } from "@/lib/types";
import { getPopularProposals } from "@/lib/view-tracker";

interface ProposalContextType {
  featuredProposals: ProposalShort[];
  allProposals: ProposalShort[];
  popularProposals: ProposalShort[];
}

const ProposalContext = createContext<ProposalContextType | undefined>(undefined);

export const useProposals = () => {
  const context = useContext(ProposalContext);
  if (!context) {
    throw new Error("useProposals must be used within a ProposalProvider");
  }
  return context;
};

const ALL_PROPOSALS_CACHE_KEY = "allProposalsCacheV2"; // bump to invalidate stale client cache
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

type AllProposalsCache = {
  timestamp: number; // Date.now()
  data: ProposalShort[];
};

export const ProposalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [featuredProposals, setFeaturedProposals] = useState<ProposalShort[]>([]);
  const [allProposals, setAllProposals] = useState<ProposalShort[]>([]);
  const [popularProposals, setPopularProposals] = useState<ProposalShort[]>([]);

  useEffect(() => {
    // Supabase/PostgREST returns at most 1 000 rows per request.
    // Page through the table so we always get every proposal.
    const fetchFromSupabase = async (): Promise<ProposalShort[]> => {
      const PAGE_SIZE = 1000;
      const supabase = createClient();
      let offset = 0;
      let rows: ProposalShort[] = [];

      /* eslint-disable no-await-in-loop */
      while (true) {
        const { data, error } = await supabase
          .from("proposals")
          .select("id, proposal_type, number, slug, title, featured, created_at")
          .order("created_at", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);

        if (error) {
          console.error("Supabase fetch error:", error);
          break;
        }

        if (data) {
          rows = rows.concat(data);
        }

        if (!data || data.length < PAGE_SIZE) {
          // Fetched the final page
          break;
        }

        offset += PAGE_SIZE;
      }

      return rows;
    };

    const loadProposals = async () => {
      try {
        // Try cache first
        const cachedRaw = localStorage.getItem(ALL_PROPOSALS_CACHE_KEY);
        const now = Date.now();

        let useCached = false;
        if (cachedRaw) {
          try {
            const parsed: AllProposalsCache = JSON.parse(cachedRaw);
            if (parsed && Array.isArray(parsed.data) && typeof parsed.timestamp === "number") {
              const fresh = now - parsed.timestamp < CACHE_TTL_MS;
              if (fresh) {
                setAllProposals(parsed.data);
                setFeaturedProposals(parsed.data.filter((p) => p.featured));
                useCached = true;
              }
            }
          } catch (e) {
            // If cache is malformed, ignore and refetch
            console.warn("Ignoring malformed cache for all proposals:", e);
          }
        }

        // Fetch fresh if no cache or cache is stale
        if (!useCached) {
          const freshData = await fetchFromSupabase();
          setAllProposals(freshData);
          setFeaturedProposals(freshData.filter((p) => p.featured));
          const payload: AllProposalsCache = { timestamp: now, data: freshData };
          localStorage.setItem(ALL_PROPOSALS_CACHE_KEY, JSON.stringify(payload));
        }

        // Always fetch a fresh list of popular proposals
        const popularData = await getPopularProposals(30, 20);
        setPopularProposals(popularData);
      } catch (e) {
        console.error("Failed to load proposals:", e);
      }
    };

    loadProposals();
  }, []);

  return (
    <ProposalContext.Provider value={{ featuredProposals, allProposals, popularProposals }}>
      {children}
    </ProposalContext.Provider>
  );
};
