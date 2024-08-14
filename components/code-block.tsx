import React, { useState } from "react";
import { useTheme } from "next-themes";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { gruvboxDark as darkTheme } from "react-syntax-highlighter/dist/esm/styles/prism";
import { gruvboxLight as lightTheme } from "react-syntax-highlighter/dist/esm/styles/hljs";

type CodeBlockProps = {
  children: string;
  language: string;
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ children, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <div className="w-full m-0 p-0">
      <SyntaxHighlighter
        className="rounded-lg"
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
