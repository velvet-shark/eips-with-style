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
    const fetchProposals = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("proposals")
        .select("id, proposal_type, number, slug, title, featured, created_at")
        .order("created_at", { ascending: false });

      if (data && !error) {
        setAllProposals(data);
        const featured = data.filter((proposal) => proposal.featured);
        setFeaturedProposals(featured);

        // Optionally, you can still use localStorage for caching if needed
        localStorage.setItem("allProposals", JSON.stringify(data));
        localStorage.setItem("featuredProposals", JSON.stringify(featured));
      }
    };

    const fetchPopularProposals = async () => {
      console.log('Fetching popular proposals...');
      const popular = await getPopularProposals(30, 20);
      console.log('Popular proposals received:', popular);
      setPopularProposals(popular);
      localStorage.setItem("popularProposals", JSON.stringify(popular));
    };

    const cachedAllProposals = localStorage.getItem("allProposals");
    const cachedFeaturedProposals = localStorage.getItem("featuredProposals");
    const cachedPopularProposals = localStorage.getItem("popularProposals");

    if (cachedAllProposals && cachedFeaturedProposals) {
      setAllProposals(JSON.parse(cachedAllProposals));
      setFeaturedProposals(JSON.parse(cachedFeaturedProposals));
    }

    if (cachedPopularProposals) {
      const cached = JSON.parse(cachedPopularProposals);
      console.log('Loading cached popular proposals:', cached);
      setPopularProposals(cached);
    }

    fetchProposals();
    fetchPopularProposals();
  }, []);

  return <ProposalContext.Provider value={{ featuredProposals, allProposals, popularProposals }}>{children}</ProposalContext.Provider>;
};
