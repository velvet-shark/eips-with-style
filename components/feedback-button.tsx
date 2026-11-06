"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useMediaQuery } from "usehooks-ts";

const PushFeedbackButton = dynamic(() => import("@/components/pushfeedback"), { ssr: false });

export default function FeedbackButton() {
  const { resolvedTheme } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <PushFeedbackButton
      project="s72ws8zp9t"
      button-position={isMobile ? "bottom-right" : "center-right"}
      modal-position="sidebar-right"
      modal-title="Thoughts? Feedback? Want to suggest a link to add?"
      button-style={resolvedTheme === "dark" ? "dark" : "light"}
      custom-font="true"
    >
      Feedback
    </PushFeedbackButton>
  );
}
