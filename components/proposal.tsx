"use client";

import React, { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Proposal } from "@/lib/types";
// import { Note } from "@/lib/types";

export default function ProposalContent({ proposal }: { proposal: Proposal }) {
  return (
    <div className="px-2">
      <div className="bg-[#1c1c1c] h-full text-sm">
        <ReactMarkdown className="markdown-body min-h-dvh" remarkPlugins={[remarkGfm]} components={{}}>
          {proposal.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
