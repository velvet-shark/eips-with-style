"use client";

import React, { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CodeBlock } from "@/components/code-block";
import { Proposal } from "@/lib/types";

export default function ProposalContent({ proposal }: { proposal: Proposal }) {
  return (
    <div className="px-2">
      <div className="h-full text-sm">
        <ReactMarkdown
          className="min-h-dvh bg-white dark:bg-[#1e1e1e] w-full max-w-4xl"
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ node, ...props }) => <h1 className="text-4xl font-bold my-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-3xl font-bold my-3" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-2xl font-semibold my-2" {...props} />,
            h4: ({ node, ...props }) => <h3 className="text-xl font-semibold my-2" {...props} />,
            p: ({ node, ...props }) => <p className="my-2 leading-relaxed" {...props} />,
            em: ({ node, ...props }) => <em className="italic" {...props} />,
            del: ({ node, ...props }) => <del className="line-through" {...props} />,
            a: ({ node, ...props }) => <a className="text-blue-500 hover:underline" {...props} />,
            img: ({ node, ...props }) => <img className="max-w-full h-auto my-4 rounded" {...props} />,
            pre: ({ node, ...props }) => (
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4" {...props} />
            ),
            table: ({ node, ...props }) => <table className="min-w-full border-collapse my-4" {...props} />,
            thead: ({ node, ...props }) => <thead className="bg-gray-200 dark:bg-gray-700" {...props} />,
            tbody: ({ node, ...props }) => <tbody {...props} />,
            tr: ({ node, ...props }) => <tr className="border-b border-gray-300 dark:border-gray-600" {...props} />,
            td: ({ node, ...props }) => <td className="px-4 py-2" {...props} />,
            th: ({ node, ...props }) => <th className="px-4 py-2 font-semibold text-left" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc list-inside my-2" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-2" {...props} />,
            li: ({ node, ...props }) => <li className="my-1" {...props} />,
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />
            ),
            code: (props) => {
              const { children, className } = props;
              // className is of the form `language-{languageName}`
              const isMultiLine = children!.toString().includes("\n");

              if (!isMultiLine) {
                return <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5">{children}</code>;
              }

              const match = /language-(\w+)/.exec(className || "");
              const language = match ? match[1] : "javascript";
              return <CodeBlock language={language}>{children as string}</CodeBlock>;
            }
          }}
        >
          {proposal.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
