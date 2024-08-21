import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { lucario as darkTheme } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight as lightTheme } from "react-syntax-highlighter/dist/esm/styles/prism";

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
    <div className="w-full m-0 mt-4 my-6 p-2 bg-[#fafafa] dark:bg-[#263e52] rounded-none border border-gray-300 dark:border-gray-600">
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
