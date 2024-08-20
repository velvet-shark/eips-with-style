"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

type Proposal = {
  id: number;
  proposal_type: string;
  number: number;
  slug: string;
  title: string;
  created_at: string;
};

interface ProposalContextType {
  featuredProposals: Proposal[];
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
  const [featuredProposals, setFeaturedProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    const fetchProposals = async () => {
      const cachedProposals = localStorage.getItem("featuredProposals");
      if (cachedProposals) {
        setFeaturedProposals(JSON.parse(cachedProposals));
      } else {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("proposals")
          .select("id, proposal_type, number, slug, title, created_at")
          .filter("featured", "eq", true)
          .order("created_at", { ascending: false });

        if (data && !error) {
          setFeaturedProposals(data);
          localStorage.setItem("featuredProposals", JSON.stringify(data));
        }
      }
    };

    fetchProposals();
  }, []);

  return <ProposalContext.Provider value={{ featuredProposals }}>{children}</ProposalContext.Provider>;
};
