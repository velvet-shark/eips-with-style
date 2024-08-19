import React from "react";
import Link from "next/link";

interface AuthorLinksProps {
  authors: string;
}

const Authors: React.FC<AuthorLinksProps> = ({ authors }) => {
  const renderAuthors = () => {
    // Split the string by commas, preserving spaces after parentheses
    const authorParts = authors.split(/(?<=\))\s*,\s*/);
    return authorParts.map((part, index) => {
      // Use regex to match the name and username, accounting for extra spaces
      const match = part.match(/^(.+?)\s*\((@\w+)\)\s*$/);
      if (match) {
        const [, name, username] = match;
        return (
          <React.Fragment key={index}>
            {name.trim().replace(/\s+/g, " ")}{" "}
            <span>
              (
              <Link
                href={`https://github.com/${username.slice(1)}`}
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                {username}
              </Link>
              )
            </span>
            {authorParts.length > 1 && index < authorParts.length - 1 && ", "}
          </React.Fragment>
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

  return <div className="block self-stretch overflow-hidden text-sm py-1">{renderAuthors()}</div>;
};

export default Authors;
