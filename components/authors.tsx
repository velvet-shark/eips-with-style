import React from "react";
import Link from "next/link";

interface AuthorLinksProps {
  authors: string;
}

const Authors: React.FC<AuthorLinksProps> = ({ authors }) => {
  const renderAuthors = () => {
    // Split the string by commas, preserving spaces after parentheses
    return authors.split(/(?<=\))\s*,\s*/).map((part, index) => {
      // Use regex to match the name and username, accounting for extra spaces
      const match = part.match(/^(.+?)\s*\((@\w+)\)\s*$/); // \(@([^)]+)\)
      if (match) {
        const [, name, username] = match;
        return (
          // prettier-ignore
          <React.Fragment key={index}>
            {name.trim().replace(/\s+/g, " ")}
            <span>(<Link href={`https://github.com/${username.slice(1)}`} className="text-blue-500 hover:underline">{username}</Link>){index <match.length ? ", " : ""}</span></React.Fragment>
        );
      }
      // If no match, just return the trimmed part
      return (
        <React.Fragment key={index}>
          {index > 0 && ", "}
          {part.trim()}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex flex-1 gap-1 items-start self-stretch min-h-8 overflow-hidden text-sm py-1">
      {renderAuthors()}
    </div>
  );
};

export default Authors;
