"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
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
const POPULAR_PROPOSALS_CACHE_KEY = "popularProposalsCacheV1";
const POPULAR_CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

type AllProposalsCache = {
  timestamp: number; // Date.now()
  data: ProposalShort[];
};

type PopularProposalsCache = {
  timestamp: number; // Date.now()
  data: ProposalShort[];
};

export const ProposalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [featuredProposals, setFeaturedProposals] = useState<ProposalShort[]>([]);
  const [allProposals, setAllProposals] = useState<ProposalShort[]>([]);
  const [popularProposals, setPopularProposals] = useState<ProposalShort[]>([]);
  const convex = useConvex();

  useEffect(() => {
    const fetchFromConvex = async (): Promise<ProposalShort[]> => {
      return convex.query(api.proposals.listAllProposals);
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
          const freshData = await fetchFromConvex();
          setAllProposals(freshData);
          setFeaturedProposals(freshData.filter((p) => p.featured));
          const payload: AllProposalsCache = { timestamp: now, data: freshData };
          localStorage.setItem(ALL_PROPOSALS_CACHE_KEY, JSON.stringify(payload));
        }

      } catch (e) {
        console.error("Failed to load proposals:", e);
      }
    };

    loadProposals();
  }, [convex]);

  useEffect(() => {
    const loadPopularProposals = async () => {
      try {
        const cachedRaw = localStorage.getItem(POPULAR_PROPOSALS_CACHE_KEY);
        const now = Date.now();
        let shouldFetch = true;

        if (cachedRaw) {
          try {
            const parsed: PopularProposalsCache = JSON.parse(cachedRaw);
            if (parsed && Array.isArray(parsed.data) && typeof parsed.timestamp === "number") {
              setPopularProposals(parsed.data);
              const fresh = now - parsed.timestamp < POPULAR_CACHE_TTL_MS;
              if (fresh) {
                shouldFetch = false;
              }
            }
          } catch (e) {
            console.warn("Ignoring malformed cache for popular proposals:", e);
          }
        }

        if (!shouldFetch) return;

        const popularData = await getPopularProposals(30, 20);
        if (popularData && popularData.length > 0) {
          setPopularProposals(popularData);
          const payload: PopularProposalsCache = { timestamp: now, data: popularData };
          localStorage.setItem(POPULAR_PROPOSALS_CACHE_KEY, JSON.stringify(payload));
        }
      } catch (e) {
        console.error("Failed to load popular proposals:", e);
      }
    };

    loadPopularProposals();
  }, []);

  return (
    <ProposalContext.Provider value={{ featuredProposals, allProposals, popularProposals }}>
      {children}
    </ProposalContext.Provider>
  );
};
