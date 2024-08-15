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
          className="min-h-dvh bg-white dark:bg-[#1e1e1e] w-full max-w-4xl text-md"
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ node, ...props }) => <h1 className="text-4xl font-bold mb-4 mt-6" {...props} />,
            h2: ({ node, ...props }) => (
              <>
                <h2 className="text-3xl font-bold mb-3 mt-5" {...props} />
                <hr className="border-t border-gray-200 dark:border-gray-700 my-2" />
              </>
            ),
            h3: ({ node, ...props }) => <h3 className="text-2xl font-semibold mb-2 mt-3" {...props} />,
            h4: ({ node, ...props }) => <h3 className="text-xl font-semibold mb-2 mt-3" {...props} />,
            h5: ({ node, ...props }) => <h3 className="text-lg font-semibold mb-2 mt-3" {...props} />,
            p: ({ node, ...props }) => <p className="my-2 leading-6" {...props} />,
            em: ({ node, ...props }) => <em className="italic" {...props} />,
            del: ({ node, ...props }) => <del className="line-through" {...props} />,
            a: ({ node, ...props }) => <a className="text-blue-500 hover:underline" {...props} />,
            img: ({ node, ...props }) => <img className="max-w-full h-auto my-4 rounded" {...props} />,
            pre: ({ node, ...props }) => <pre className="" {...props} />,
            table: ({ node, ...props }) => <table className=" border-collapse my-4 border" {...props} />,
            thead: ({ node, ...props }) => <thead className="bg-gray-200 dark:bg-gray-700" {...props} />,
            tbody: ({ node, ...props }) => <tbody {...props} />,
            tr: ({ node, ...props }) => <tr className="border-b border-gray-300 dark:border-gray-600" {...props} />,
            td: ({ node, ...props }) => <td className="px-4 py-2" {...props} />,
            th: ({ node, ...props }) => <th className="px-4 py-2 font-semibold text-left" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc list-inside pl-4 my-4" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal list-inside pl-4 my-4" {...props} />,
            li: ({ node, ...props }) => <li className="my-1.5" {...props} />,
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />
            ),
            code: (props) => {
              const { children, className } = props;
              // className is of the form `language-{languageName}`
              const isMultiLine = children!.toString().includes("\n");

              if (!isMultiLine) {
                return (
                  <code className="bg-[#eef] dark:bg-[#3a3a4d] text-[#9b5af7] dark:text-[#c9dcff] rounded px-1 py-0.5">
                    {children}
                  </code>
                );
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
