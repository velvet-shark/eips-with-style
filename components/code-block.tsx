import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { shadesOfPurple as darkTheme } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { atelierSulphurpoolLight as lightTheme } from "react-syntax-highlighter/dist/esm/styles/hljs";

type CodeBlockProps = {
  children: string;
  language: string;
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ children, language }) => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full m-0 mt-4 my-6 p-2 bg-[#f5f7ff] dark:bg-[#2d2b57] rounded-none border border-gray-300 dark:border-gray-600">
      <SyntaxHighlighter
        className="rounded-none"
        language={language}
        style={useTheme().resolvedTheme === "dark" ? darkTheme : lightTheme}
        lineProps={{
          style: {
            wordBreak: "break-word",
            whiteSpace: "pre-wrap"
          }
        }}
        wrapLines={true}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

// w-6 h-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition
