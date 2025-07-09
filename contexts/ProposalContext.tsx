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

export const ProposalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [featuredProposals, setFeaturedProposals] = useState<ProposalShort[]>([]);
  const [allProposals, setAllProposals] = useState<ProposalShort[]>([]);
  const [popularProposals, setPopularProposals] = useState<ProposalShort[]>([]);

  useEffect(() => {
    const fetchAndSetProposals = async () => {
      // First, try to load all proposals from cache
      const cachedAllProposals = localStorage.getItem("allProposals");
      if (cachedAllProposals) {
        const allData = JSON.parse(cachedAllProposals);
        setAllProposals(allData);
        setFeaturedProposals(allData.filter((p: ProposalShort) => p.featured));
      } else {
        // If not in cache, fetch from Supabase
        const supabase = createClient();
        const { data, error } = await supabase
          .from("proposals")
          .select("id, proposal_type, number, slug, title, featured, created_at")
          .order("created_at", { ascending: false });

        if (data && !error) {
          setAllProposals(data);
          setFeaturedProposals(data.filter((p) => p.featured));
          localStorage.setItem("allProposals", JSON.stringify(data));
        }
      }

      // Always fetch a fresh list of popular proposals
      const popularData = await getPopularProposals(30, 20);
      setPopularProposals(popularData);
    };

    fetchAndSetProposals();
  }, []);

  return (
    <ProposalContext.Provider value={{ featuredProposals, allProposals, popularProposals }}>
      {children}
    </ProposalContext.Provider>
  );
};
