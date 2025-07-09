"use client";

import { useEffect } from "react";
import { trackProposalView } from "@/lib/view-tracker";

interface ViewTrackerProps {
  proposalId: string;
}

export default function ViewTracker({ proposalId }: ViewTrackerProps) {
  useEffect(() => {
    // Track the view after a short delay to avoid tracking quick page bounces
    const timer = setTimeout(() => {
      trackProposalView(proposalId);
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [proposalId]);

  // This component doesn't render anything
  return null;
}
